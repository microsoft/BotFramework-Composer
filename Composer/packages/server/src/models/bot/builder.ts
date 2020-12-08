// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-var-requires */
import { pathExists, writeFile, copy } from 'fs-extra';
import { FileInfo, IConfig, SDKKinds } from '@bfc/shared';
import { ComposerReservoirSampler } from '@microsoft/bf-dispatcher/lib/mathematics/sampler/ComposerReservoirSampler';
import { ComposerBootstrapSampler } from '@microsoft/bf-dispatcher/lib/mathematics/sampler/ComposerBootstrapSampler';
import { luImportResolverGenerator, getLUFiles, getQnAFiles } from '@bfc/shared/lib/luBuildResolver';
import { Orchestrator } from '@microsoft/bf-orchestrator';
import keys from 'lodash/keys';

import { Path } from '../../utility/path';
import { IFileStorage } from '../storage/interface';
import log from '../../logger';

import { IOrchestratorBuildOutput, IOrchestratorNLRList, IOrchestratorProgress } from './interface';

const crossTrainer = require('@microsoft/bf-lu/lib/parser/cross-train/crossTrainer.js');
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
const qnaBuild = require('@microsoft/bf-lu/lib/parser/qnabuild/builder.js');
const LuisBuilder = require('@microsoft/bf-lu/lib/parser/luis/luisBuilder');
const luisToLuContent = require('@microsoft/bf-lu/lib/parser/luis/luConverter');

const GENERATEDFOLDER = 'generated';
const SETTINGS = 'settings';
const INTERRUPTION = 'interruption';
const SAMPLE_SIZE_CONFIGURATION = 2;
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
  maxUtteranceAllowed: number;
};

export class Builder {
  public botDir: string;
  public generatedFolderPath: string;
  public interruptionFolderPath: string;
  public storage: IFileStorage;
  public config: IConfig | null = null;
  public downSamplingConfig: DownSamplingConfig = { maxImbalanceRatio: 0, maxUtteranceAllowed: 0 };
  private _locale: string;
  private containOrchestrator = false;

  private luBuilder = new luBuild.Builder((message) => {
    log(message);
  });
  private qnaBuilder = new qnaBuild.Builder((message) => {
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
    emptyFiles: { [key: string]: boolean }
  ) => {
    try {
      await this.createGeneratedDir();
      //do cross train before publish
      await this.crossTrain(luFiles, qnaFiles, allFiles);
      await this.downSampling((await this.getInterruptionFiles()).interruptionLuFiles);

      const { interruptionLuFiles, interruptionQnaFiles } = await this.getInterruptionFiles();
      const { luBuildFiles, orchestratorBuildFiles } = this.separateLuFiles(interruptionLuFiles, allFiles);
      if (orchestratorBuildFiles.length) {
        this.containOrchestrator = true;
      } else {
        this.containOrchestrator = false;
      }
      await this.runLuBuild(luBuildFiles);
      await this.runQnaBuild(interruptionQnaFiles);
      await this.runOrchestratorBuild(orchestratorBuildFiles, emptyFiles);
    } catch (error) {
      throw new Error(error.message ?? error.text ?? 'Error publishing to LUIS or QNA.');
    }
  };

  public getQnaEndpointKey = async (subscriptionKey: string, config: IConfig | Record<string, any>) => {
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

    const nlrList = await this.runOrchestratorNlrList();
    const defaultNLR = nlrList.default;
    const modelPath = Path.resolve(await this.getModelPathAsync(), defaultNLR.replace('.onnx', ''));

    if (!(await pathExists(modelPath))) {
      const handler: IOrchestratorProgress = (status) => {
        log(status);
      };
      await this.runOrchestratorNlrGet(modelPath, defaultNLR, handler, handler);
    }

    // build snapshots from LU files
    const returnData = await this.orchestratorBuilder(luFiles, modelPath);

    // write snapshot data into /generated folder
    const snapshots: any = {};
    for (const dialog of returnData.outputs) {
      const bluFilePath = Path.resolve(this.generatedFolderPath, dialog.id.replace('.lu', '.blu'));
      snapshots[dialog.id.replace('.lu', '').replace(/[-.]/g, '_')] = bluFilePath;

      await writeFile(bluFilePath, Buffer.from(dialog.snapshot));
    }

    // write settings into /generated/orchestrator.settings.json
    const orchestratorSettings: any = {
      orchestrator: {
        ModelPath: modelPath,
      },
    };

    orchestratorSettings.orchestrator.snapshots = snapshots;
    const orchestratorSettingsPath = Path.resolve(this.generatedFolderPath, 'orchestrator.settings.json');
    await writeFile(orchestratorSettingsPath, JSON.stringify(orchestratorSettings));
  };

  /**
   * Orchestrator: Get available list of NLR models
   */
  public async runOrchestratorNlrList(): Promise<IOrchestratorNLRList> {
    return await Orchestrator.baseModelGetVersionsAsync();
  }

  /**
   * Orchestrator: Download an available NLR model.
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
    onProgress: IOrchestratorProgress,
    onFinish: IOrchestratorProgress
  ): Promise<void> {
    await Orchestrator.baseModelGetAsync(modelPath, nlrId, onProgress, onFinish);
  }

  /**
   * Orchestrator: Build command to compile .lu files into Binary LU (.blu) snapshots.
   *
   * A snapshot (.blu file) is created per .lu supplied
   *
   * @param files - Array of FileInfo
   * @param modelPath - Path to NLR model folder
   * @param isDialog - Flag to toggle creation of Recognizer Dialogs (default: true)
   * @param fullEmbedding - Use larger embeddings and skip size optimization (default: false)
   * @returns An object containing snapshot bytes and recognizer dialogs for each .lu file
   */
  public async orchestratorBuilder(
    files: FileInfo[],
    modelPath: string,
    isDialog = true,
    fullEmbedding = false
  ): Promise<IOrchestratorBuildOutput> {
    const luObjects = files
      .filter((fi) => fi.name.endsWith('.lu') && fi.content)
      .map((fi) => ({
        id: fi.name,
        content: fi.content,
      }));

    return await Orchestrator.buildAsync(modelPath, luObjects, isDialog, '', null, fullEmbedding);
  }

  public async copyModelPathToBot() {
    if (this.containOrchestrator) {
      const nlrList = await this.runOrchestratorNlrList();
      const defaultNLR = nlrList.default;
      const folderName = defaultNLR.replace('.onnx', '');
      const modelPath = Path.resolve(await this.getModelPathAsync(), folderName);
      const destDir = Path.resolve(Path.join(this.botDir, MODEL), folderName);
      await copy(modelPath, destDir);
      await this.updateOrchestratorSetting(folderName);
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
    const qna: any = {};

    const qnaConfig = await JSON.parse(qnaConfigFile);
    const endpointKey = await this.qnaBuilder.getEndpointKeys(config.subscriptionKey, subscriptionKeyEndpoint);
    Object.assign(qna, qnaConfig.qna, { endpointKey: endpointKey.primaryEndpointKey });

    return qna;
  }

  private async updateOrchestratorSetting(dirName: string) {
    const runtimeRootPath = './ComposerDialogs';
    const settingPath = Path.join(this.generatedFolderPath, 'orchestrator.settings.json');
    const content = JSON.parse(await this.storage.readFile(settingPath));
    content.orchestrator.ModelPath = `${runtimeRootPath}/${MODEL}/${dirName}`;
    keys(content.orchestrator.snapshots).forEach((key) => {
      const values = content.orchestrator.snapshots[key].split('ComposerDialogs');
      content.orchestrator.snapshots[key] = `${runtimeRootPath}${values[1]}`;
    });
    await this.storage.writeFile(settingPath, JSON.stringify(content, null, 2));
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
    //do bootstramp sampling to make the utterances' number ratio to 1:10
    const bootstrapSampler = new ComposerBootstrapSampler(
      luObject.utterances,
      this.downSamplingConfig.maxImbalanceRatio,
      SAMPLE_SIZE_CONFIGURATION
    );
    luObject.utterances = bootstrapSampler.getSampledUtterances();
    //if detect the utterances>15000, use reservoir sampling to down size
    const reservoirSampler = new ComposerReservoirSampler(
      luObject.utterances,
      this.downSamplingConfig.maxUtteranceAllowed
    );
    luObject.utterances = reservoirSampler.getSampledUtterances();
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

  private async downSampling(files: FileInfo[]) {
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

  private async runLuBuild(files: FileInfo[]) {
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
    });

    await this.luBuilder.writeDialogAssets(buildResult, {
      force: true,
      out: this.generatedFolderPath,
    });
  }

  private async runQnaBuild(files: FileInfo[]) {
    const config = this._getConfig(files);

    const qnaContents = await this.qnaBuilder.loadContents(config.models, {
      culture: config.fallbackLocal,
    });

    if (qnaContents) {
      const subscriptionKeyEndpoint = `https://${config.qnaRegion}.api.cognitive.microsoft.com/qnamaker/v4.0`;

      const buildResult = await this.qnaBuilder.build(qnaContents, config.subscriptionKey, config.botName, {
        endpoint: subscriptionKeyEndpoint,
        suffix: config.suffix,
      });

      await this.qnaBuilder.writeDialogAssets(buildResult, {
        force: true,
        out: this.generatedFolderPath,
      });
    }
  }

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
      region: this.config.authoringRegion || '',
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
