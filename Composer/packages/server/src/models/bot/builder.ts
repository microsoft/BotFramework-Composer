// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-var-requires */
import { pathExists, writeFile, copy, existsSync, mkdirSync } from 'fs-extra';
import { FileInfo, IConfig, SDKKinds } from '@bfc/shared';
import { ComposerReservoirSampler } from '@microsoft/bf-dispatcher/lib/mathematics/sampler/ComposerReservoirSampler';
import { luImportResolverGenerator, getLUFiles, getQnAFiles } from '@bfc/shared/lib/luBuildResolver';
import { Orchestrator } from '@microsoft/bf-orchestrator';
import cloneDeep from 'lodash/cloneDeep';
import keys from 'lodash/keys';
import has from 'lodash/has';
import partition from 'lodash/partition';

import { Path } from '../../utility/path';
import { IFileStorage } from '../storage/interface';
import log from '../../logger';
import { setEnvDefault } from '../../utility/setEnvDefault';
import { useElectronContext } from '../../utility/electronContext';
import { COMPOSER_VERSION } from '../../constants';

import { IOrchestratorNLRList, IOrchestratorProgress, IOrchestratorSettings } from './interface';
import orchestratorBuilder from './process/orchestratorBuilder';

const crossTrainer = require('@microsoft/bf-lu/lib/parser/cross-train/crossTrainer.js');
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
const qnaBuild = require('@microsoft/bf-lu/lib/parser/qnabuild/builder.js');
const LuisBuilder = require('@microsoft/bf-lu/lib/parser/luis/luisBuilder');
const luisToLuContent = require('@microsoft/bf-lu/lib/parser/luis/luConverter');

const GENERATEDFOLDER = 'generated';
const SETTINGS = 'settings';
const INTERRUPTION = 'interruption';
const CrossTrainConfigName = 'cross-train.config.json';
const MODEL = 'model';

export type SingleConfig = {
  rootDialog: boolean;
  triggers: {
    [key: string]: string[];
  };
};

export type CrossTrainConfig = {
  [key: string]: SingleConfig;
};

export type DownSamplingConfig = {
  maxImbalanceRatio: number;
};

const getUserAgent = () => {
  const platform = useElectronContext() ? 'desktop' : 'web';
  return `microsoft.bot.composer/${COMPOSER_VERSION} ${platform}`;
};

export class Builder {
  public botDir: string;
  public generatedFolderPath: string;
  public interruptionFolderPath: string;
  public storage: IFileStorage;
  public config: IConfig | null = null;
  public downSamplingConfig: DownSamplingConfig = { maxImbalanceRatio: -1 };
  private _locale: string;
  private orchestratorSettings: IOrchestratorSettings = {
    orchestrator: {
      models: {},
      snapshots: {},
    },
  };

  public luBuilder = new luBuild.Builder((message) => {
    log(message);
  });
  public qnaBuilder = new qnaBuild.Builder((message) => {
    log(message);
  });

  constructor(path: string, storage: IFileStorage, locale: string) {
    this.botDir = path;
    this.generatedFolderPath = Path.join(this.botDir, GENERATEDFOLDER);
    this.interruptionFolderPath = Path.join(this.generatedFolderPath, INTERRUPTION);
    this.storage = storage;
    this._locale = locale;
  }

  public set rootDir(path: string) {
    this.botDir = path;
    this.generatedFolderPath = Path.join(this.botDir, GENERATEDFOLDER);
    this.interruptionFolderPath = Path.join(this.generatedFolderPath, INTERRUPTION);
  }

  public build = async (
    luFiles: FileInfo[],
    qnaFiles: FileInfo[],
    allFiles: FileInfo[],
    emptyFiles: { [key: string]: boolean },
    directVersionPublish: boolean
  ) => {
    const userAgent = getUserAgent();
    setEnvDefault('LUIS_USER_AGENT', userAgent);
    setEnvDefault('QNA_USER_AGENT', userAgent);

    try {
      //warm up the orchestrator build cache before deleting and recreating the generated folder
      await orchestratorBuilder.warmupCache(this.botDir, this.generatedFolderPath);
    } catch (err) {
      log(err);
    }

    try {
      await this.createGeneratedDir();
      //do cross train before publish
      await this.crossTrain(luFiles, qnaFiles, allFiles);
      await this.downSamplingInterruption((await this.getInterruptionFiles()).interruptionLuFiles);

      const { interruptionLuFiles, interruptionQnaFiles } = await this.getInterruptionFiles();
      const { luBuildFiles, orchestratorBuildFiles } = this.separateLuFiles(interruptionLuFiles, allFiles);
      await this.runLuBuild(luBuildFiles, directVersionPublish);
      await this.runQnaBuild(interruptionQnaFiles);
      await this.runOrchestratorBuild(orchestratorBuildFiles, emptyFiles);
    } catch (error) {
      throw new Error(error.message ?? error.text ?? 'Error publishing to LUIS or QNA.');
    }
  };

  public getQnaEndpointKey = async (subscriptionKey: string, config: IConfig) => {
    try {
      const subscriptionKeyEndpoint = `https://${config?.qnaRegion}.api.cognitive.microsoft.com/qnamaker/v4.0`;
      const endpointKey = await this.qnaBuilder.getEndpointKeys(subscriptionKey, subscriptionKeyEndpoint);
      return endpointKey.primaryEndpointKey;
    } catch (error) {
      throw new Error(error.message ?? error.text ?? 'Error publishing to get QNA EndpointKey.');
    }
  };

  public setBuildConfig(config: IConfig, downSamplingConfig: DownSamplingConfig) {
    this.config = config;
    this.downSamplingConfig = downSamplingConfig;
  }

  public get locale(): string {
    return this._locale;
  }

  public set locale(v: string) {
    this._locale = v;
  }

  public getModelPathAsync = async () => {
    let appDataPath = '';
    if (process?.versions?.hasOwnProperty('electron')) {
      const { app } = await import('electron');
      appDataPath = app.getPath('appData');
    } else {
      appDataPath = process.env.APPDATA || process.env.HOME || '';
    }
    const baseModelPath = Path.resolve(appDataPath, 'BotFrameworkComposer', 'models');
    return baseModelPath;
  };

  /**
   * Orchestrator: Perform the full build process
   * 1) Query the Orchestrator service for the latest default NLR model
   * 2) If the default model has changed or never been downloaded, download it to user's AppData/BotFrameworkComposer folder
   * 3) Generate the embedding/snapshot data for Orchestrator (.blu files) and place in /generated folder
   * 4) Generate settings file for runtime containing model and snapshot paths and place in /generated folder
   * @param luFiles LU Files needed to build snapshot data
   */
  public runOrchestratorBuild = async (luFiles: FileInfo[], emptyFiles: { [key: string]: boolean }) => {
    if (!luFiles.filter((file) => !emptyFiles[file.name]).length) return;

    const [enLuFiles, multiLangLuFiles] = partition(luFiles, (f) =>
      f.name.split('.')?.[1]?.toLowerCase()?.startsWith('en')
    );

    const nlrList = await this.runOrchestratorNlrList();

    const modelDatas = [
      { model: this.config?.model?.en_intent ?? nlrList?.defaults?.en_intent, lang: 'en', luFiles: enLuFiles },
      {
        model: this.config?.model?.multilingual_intent ?? nlrList?.defaults?.multilingual_intent,
        lang: 'multilang',
        luFiles: multiLangLuFiles,
      },
    ];

    for (const modelData of modelDatas) {
      if (modelData.luFiles.length) {
        if (!modelData.model) {
          throw new Error('Model not set');
        }
        const modelPath = Path.resolve(await this.getModelPathAsync(), modelData.model.replace('.onnx', ''));
        if (!(await pathExists(modelPath))) {
          throw new Error('Orchestrator Model missing: ' + modelPath);
        }
        const snapshotData = await this.buildOrchestratorSnapshots(modelPath, modelData.luFiles, emptyFiles);

        this.orchestratorSettings.orchestrator.models[modelData.lang] = modelPath;
        this.orchestratorSettings.orchestrator.snapshots = snapshotData;
      }
    }

    if (this.orchestratorSettings.orchestrator.models.en || this.orchestratorSettings.orchestrator.models.multilang) {
      const orchestratorSettingsPath = Path.resolve(this.generatedFolderPath, 'orchestrator.settings.json');
      await writeFile(orchestratorSettingsPath, JSON.stringify(this.orchestratorSettings, null, 2));
    }
  };

  /**
   * Orchestrator: Write out the embeddings (snapshots) into Binary LU  (.blu) files.
   *
   * Part of the Orchestrator training pipeline
   * @param modelPath Local Path to the model that is used for training
   * @param luFiles Array of FileInfo[] to the LU files that are used for training
   */
  public buildOrchestratorSnapshots = async (
    modelPath: string,
    luFiles: FileInfo[],
    emptyFiles: { [key: string]: boolean }
  ) => {
    if (!luFiles.filter((file) => !emptyFiles[file.name]).length) return {};
    // build snapshots from LU files
    return await orchestratorBuilder.build(this.botDir, luFiles, modelPath, this.generatedFolderPath);
  };

  /**
   * Orchestrator: Get available list of NLR models
   */
  public async runOrchestratorNlrList(): Promise<IOrchestratorNLRList> {
    return await Orchestrator.baseModelGetVersionsAsync();
  }

  /**
   * Orchestrator: Download an available NLR model given an nlrId
   *
   * @remarks Available NLR models and VersionIds are obtained by running runOrchestratorNlrList first.
   *
   * @param modelPath - Folder path to save NLR model
   * @param nlrId - VersionId of the model
   * @param onProgress - Callback to notify of D/L progress
   * @param onFinish - Callback to notify of D/L completed
   */
  public async runOrchestratorNlrGet(
    modelPath: string,
    nlrId: string,
    onProgress: IOrchestratorProgress = (status) => {
      log(status);
    },
    onFinish: IOrchestratorProgress = (status) => {
      log(status);
    }
  ): Promise<void> {
    if (!(await pathExists(modelPath))) {
      await Orchestrator.baseModelGetAsync(modelPath, nlrId, onProgress, onFinish);
    }
  }

  /**
   * Orchestrator: Copy language models into bot project (in preparation for publishing)
   *
   * Models are placed as a sibling to ComposerDialogs by default
   */
  public async copyModelPathToBot(isUsingAdaptiveRuntime: boolean) {
    for (const lang in this.orchestratorSettings.orchestrator.models) {
      const modelName = Path.basename(this.orchestratorSettings.orchestrator.models[lang], '.onnx');

      const destDir = isUsingAdaptiveRuntime
        ? Path.resolve(this.botDir, MODEL, modelName)
        : Path.resolve(this.botDir, '..', MODEL, modelName);

      await copy(this.orchestratorSettings.orchestrator.models[lang], destDir);
    }

    await this.updateOrchestratorSetting(isUsingAdaptiveRuntime);
  }

  /**
   * Orchestrator: Update Orchestrator Settings for publishing
   *
   * Models are located in <project root>/model
   * In the Adaptive Runtime, Orchestrator snapshot files are located in <project root>/generated.
   * In the Legacy Runtime, Orchestrator snapshot files are located in <project root>/ComposerDialogs/generated.
   */
  private async updateOrchestratorSetting(isUsingAdaptiveRuntime: boolean) {
    const settingPath = Path.join(this.botDir, GENERATEDFOLDER, 'orchestrator.settings.json');
    const content = cloneDeep(this.orchestratorSettings);

    keys(content.orchestrator.models).forEach((modelPath) => {
      const modelName = Path.basename(content.orchestrator.models[modelPath], '.onnx');
      content.orchestrator.models[modelPath] = Path.join(MODEL, modelName);
    });

    keys(content.orchestrator.snapshots).forEach((key) => {
      const snapshotName = Path.basename(content.orchestrator.snapshots[key]);

      content.orchestrator.snapshots[key] = isUsingAdaptiveRuntime
        ? Path.join(GENERATEDFOLDER, snapshotName)
        : Path.join('ComposerDialogs', GENERATEDFOLDER, snapshotName);
    });

    if (this.orchestratorSettings.orchestrator.models.en || this.orchestratorSettings.orchestrator.models.multilang) {
      await this.storage.writeFile(settingPath, JSON.stringify(content, null, 2));
    }
  }

  public async getQnaConfig() {
    const config = this._getConfig([]);
    const subscriptionKeyEndpoint = `https://${config?.qnaRegion}.api.cognitive.microsoft.com/qnamaker/v4.0`;
    // Find any files that contain the name 'qnamaker.settings' in them
    // These are generated by the LuBuild process and placed in the generated folder
    // These contain dialog-to-luis app id mapping
    const paths = await this.storage.glob('qnamaker.settings.*', this.generatedFolderPath);
    if (!paths.length) return {};

    const qnaConfigFile = await this.storage.readFile(Path.join(this.generatedFolderPath, paths[0]));
    const qna = {};

    const qnaConfig = await JSON.parse(qnaConfigFile);
    const endpointKey = await this.qnaBuilder.getEndpointKeys(config.subscriptionKey, subscriptionKeyEndpoint);
    Object.assign(qna, qnaConfig.qna, { endpointKey: endpointKey.primaryEndpointKey });

    return qna;
  }

  private async createGeneratedDir() {
    // clear previous folder
    await this.deleteDir(this.generatedFolderPath);
    //remove the cross train result
    await this.cleanCrossTrain();
    await this.storage.mkDir(this.generatedFolderPath);
  }

  private async crossTrain(luFiles: FileInfo[], qnaFiles: FileInfo[], allFiles: FileInfo[]) {
    const crossTrainConfigPath = Path.join(this.botDir, SETTINGS, CrossTrainConfigName);
    let crossTrainConfig = {};
    if (await this.storage.exists(crossTrainConfigPath)) {
      const crossTrainConfigStr = await this.storage.readFile(crossTrainConfigPath);
      if (crossTrainConfigStr) {
        crossTrainConfig = JSON.parse(crossTrainConfigStr);
      }
    }
    const luContents = luFiles.map((file) => {
      return { content: file.content, id: Path.basename(file.name, '.lu') };
    });

    const qnaContents = qnaFiles.map((file) => {
      return { content: file.content, id: Path.basename(file.name, '.qna') };
    });

    const importResolver = luImportResolverGenerator([...getLUFiles(allFiles), ...getQnAFiles(allFiles)]);
    const result = await crossTrainer.crossTrain(luContents, qnaContents, crossTrainConfig, { importResolver });

    await this.writeFiles(result.luResult, 'lu');
    await this.writeFiles(result.qnaResult, 'qna');
  }

  private async getInterruptionFiles() {
    const files = await this.storage.readDir(this.interruptionFolderPath);
    const interruptionLuFiles: FileInfo[] = [];
    const interruptionQnaFiles: FileInfo[] = [];

    for (const file of files) {
      const content = await this.storage.readFile(Path.join(this.interruptionFolderPath, file));
      const path = Path.join(this.interruptionFolderPath, file);
      const stats = await this.storage.stat(path);
      const fileInfo: FileInfo = {
        name: file,
        content,
        path: Path.join(this.interruptionFolderPath, file),
        relativePath: Path.relative(this.interruptionFolderPath, path),
        lastModified: stats.lastModified,
      };
      if (file.endsWith('qna')) {
        interruptionQnaFiles.push(fileInfo);
      } else if (file.endsWith('lu')) {
        interruptionLuFiles.push(fileInfo);
      }
    }
    return { interruptionLuFiles, interruptionQnaFiles };
  }

  private doDownSampling(luObject: any) {
    if (!luObject) return luObject;

    //separate the intents, we only do downsampling for interruption intent
    const intentsMap = {};
    const normalItems: any[] = [];
    const interruptionItems: any[] = [];
    [...luObject.utterances, ...luObject.patterns].forEach((utterance) => {
      const { intent } = utterance;
      if (utterance.intent === '_Interruption') {
        interruptionItems.push(utterance);
      } else {
        normalItems.push(utterance);
        intentsMap[intent] = (intentsMap[intent] ?? 0) + 1;
      }
    });

    //find the minimum utterance length from the normal intents
    const minNum = keys(intentsMap).reduce((result, key, index) => {
      if (index === 0) return intentsMap[key];
      return intentsMap[key] < result ? intentsMap[key] : result;
    }, 0);

    //downsize the interruption utterances to ratio*the minimum length of normal intent utterances
    const reservoirSampler = new ComposerReservoirSampler(
      interruptionItems,
      this.downSamplingConfig.maxImbalanceRatio * minNum
    );
    const finalItems = [...normalItems, ...reservoirSampler.getSampledUtterances()];
    luObject.utterances = finalItems.filter((item) => !has(item, 'pattern'));
    luObject.patterns = finalItems.filter((item) => has(item, 'pattern'));
    return luObject;
  }

  private async downsizeUtterances(luContents: any) {
    return await Promise.all(
      luContents.map(async (luContent) => {
        if (luContent.content) {
          const result = await LuisBuilder.fromLUAsync(luContent.content);
          const sampledResult = this.doDownSampling(result);
          const content = luisToLuContent(sampledResult);
          return { ...luContent, content };
        }

        return luContent;
      })
    );
  }

  private async writeFiles(crossTrainResult, fileExtension: 'lu' | 'qna') {
    if (!(await this.storage.exists(this.interruptionFolderPath))) {
      await this.storage.mkDir(this.interruptionFolderPath);
    }
    await Promise.all(
      [...crossTrainResult.keys()].map(async (key: string) => {
        const fileName = `${key}.${fileExtension}`;
        const newFileId = Path.join(this.interruptionFolderPath, fileName);
        await this.storage.writeFile(newFileId, crossTrainResult.get(key).Content);
      })
    );
  }

  private async downSamplingInterruption(files: FileInfo[]) {
    if (this.downSamplingConfig.maxImbalanceRatio === -1) return;

    const models = files.map((file) => file.path);

    let luContents = await this.luBuilder.loadContents(models, {
      culture: this.config?.defaultLanguage || 'en-us',
    });

    luContents = await this.downsizeUtterances(luContents);
    //write downsampling result to the interruption folder
    await Promise.all(
      luContents.map(async ({ path, content }) => {
        return await this.storage.writeFile(path, content);
      })
    );
  }

  private async runLuBuild(files: FileInfo[], directVersionPublish: boolean) {
    if (!files.length) return;

    const config = this._getConfig(files);

    const luContents = await this.luBuilder.loadContents(config.models, {
      culture: config.fallbackLocal,
    });

    const authoringEndpoint = config.authoringEndpoint ?? `https://${config.region}.api.cognitive.microsoft.com`;

    const buildResult = await this.luBuilder.build(luContents, config.authoringKey, config.botName, {
      endpoint: authoringEndpoint,
      suffix: config.suffix,
      keptVersionCount: 10,
      isStaging: false,
      region: config.region,
      directVersionPublish: directVersionPublish,
    });

    await this.writeLuisSettings(buildResult, this.generatedFolderPath, directVersionPublish);
  }

  private async runQnaBuild(files: FileInfo[]) {
    const config = this._getConfig(files);

    const qnaContents = await this.qnaBuilder.loadContents(config.models, {
      culture: config.fallbackLocal,
    });

    //we need to filter the source qna file out.
    const filteredQnaContents = qnaContents?.filter((content) => !content.id.endsWith('.source'));

    if (!filteredQnaContents || filteredQnaContents.length === 0) return;

    const subscriptionKeyEndpoint = `https://${config.qnaRegion}.api.cognitive.microsoft.com/qnamaker/v4.0`;

    const buildResult = await this.qnaBuilder.build(filteredQnaContents, config.subscriptionKey, config.botName, {
      endpoint: subscriptionKeyEndpoint,
      suffix: config.suffix,
    });

    await this.qnaBuilder.writeDialogAssets(buildResult, {
      force: true,
      out: this.generatedFolderPath,
    });
  }

  private writeLuisSettings = async (contents, out: string, directVersionPublish: boolean) => {
    const settingsContents = contents.filter((c) => c.id && c.id.endsWith('.json'));
    if (settingsContents && settingsContents.length > 0) {
      const outPath = Path.join(Path.resolve(out), settingsContents[0].id);

      //merge
      const mergedSettings = { path: '', luis: {} };
      for (const content of contents) {
        const luisAppsMap = JSON.parse(content.content).luis;
        for (const appName of Object.keys(luisAppsMap)) {
          mergedSettings.luis[appName] = {
            appId: luisAppsMap[appName].appId,
            version: luisAppsMap[appName].version,
          };
          if (!directVersionPublish) {
            delete mergedSettings.luis[appName].version;
          }
        }
      }

      const newContent = {
        content: JSON.stringify({ luis: mergedSettings.luis }, null, 4),
        path: Path.basename(outPath),
      };

      //write
      let outFilePath;
      if (out) {
        outFilePath = Path.join(Path.resolve(out), Path.basename(newContent.path));
      } else {
        outFilePath = newContent.path;
      }
      if (!existsSync(Path.dirname(outFilePath))) {
        mkdirSync(Path.dirname(outFilePath));
      }
      await writeFile(outFilePath, newContent.content, 'utf-8');
    }
  };

  //delete files in generated folder
  private async deleteDir(path: string) {
    if (await this.storage.exists(path)) {
      const files = await this.storage.readDir(path);
      for (const file of files) {
        const curPath = Path.join(path, file);
        if ((await this.storage.stat(curPath)).isDir) {
          await this.deleteDir(curPath);
        } else {
          await this.storage.removeFile(curPath);
        }
      }
      await this.storage.rmDir(path);
    }
  }

  private _getConfig = (files: FileInfo[]) => {
    if (!this.config) {
      throw new Error('Please complete your LUIS settings');
    }

    return {
      authoringKey: this.config.authoringKey || '',
      subscriptionKey: this.config.subscriptionKey || '',
      region: this.config.authoringRegion || this.config.region || 'westus',
      qnaRegion: this.config.qnaRegion || this.config.authoringRegion || '',
      botName: this.config.name || '',
      suffix: this.config.environment || 'composer',
      fallbackLocal: this.config.defaultLanguage || 'en-us',
      endpoint: this.config.endpoint || null,
      authoringEndpoint: this.config.authoringEndpoint || null,
      models: files.map((file) => file.path),
    };
  };

  private separateLuFiles = (luFiles: FileInfo[], allFiles: FileInfo[]) => {
    const luRecoginzers = allFiles.filter((item) => item.name.endsWith('.lu.dialog'));
    const luBuildFiles: FileInfo[] = [];
    const orchestratorBuildFiles: FileInfo[] = [];

    luFiles.forEach((file) => {
      const recognizer = luRecoginzers.find((item) => item.name.replace('.dialog', '') === file.name);
      if (recognizer && JSON.parse(recognizer.content).$kind === SDKKinds.OrchestratorRecognizer) {
        orchestratorBuildFiles.push(file);
      } else {
        luBuildFiles.push(file);
      }
    });

    return {
      luBuildFiles,
      orchestratorBuildFiles,
    };
  };

  private async cleanCrossTrain() {
    await this.deleteDir(this.interruptionFolderPath);
  }
}
