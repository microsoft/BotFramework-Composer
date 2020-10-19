// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-var-requires */
import { FileInfo, IConfig } from '@bfc/shared';
import { ComposerReservoirSampler } from '@microsoft/bf-dispatcher/lib/mathematics/sampler/ComposerReservoirSampler';
import { ComposerBootstrapSampler } from '@microsoft/bf-dispatcher/lib/mathematics/sampler/ComposerBootstrapSampler';
import { Orchestrator } from '@microsoft/bf-orchestrator';

import { Path } from '../../utility/path';
import { IFileStorage } from '../storage/interface';
import log from '../../logger';

import { IOrchestratorBuildOutput, IOrchestratorNLRList, IOrchestratorProgress } from './interface';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crossTrainer = require('@microsoft/bf-lu/lib/parser/cross-train/crossTrainer.js');
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
const qnaBuild = require('@microsoft/bf-lu/lib/parser/qnabuild/builder.js');
const LuisBuilder = require('@microsoft/bf-lu/lib/parser/luis/luisBuilder');
const luisToLuContent = require('@microsoft/bf-lu/lib/parser/luis/luConverter');

const GENERATEDFOLDER = 'generated';
const INTERUPTION = 'interuption';
const SAMPLE_SIZE_CONFIGURATION = 2;

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
  public crossTrainConfig: CrossTrainConfig = {};

  private luBuilder = new luBuild.Builder((message) => {
    log(message);
  });
  private qnaBuilder = new qnaBuild.Builder((message) => {
    log(message);
  });

  constructor(path: string, storage: IFileStorage, locale: string) {
    this.botDir = path;
    this.generatedFolderPath = Path.join(this.botDir, GENERATEDFOLDER);
    this.interruptionFolderPath = Path.join(this.generatedFolderPath, INTERUPTION);
    this.storage = storage;
    this._locale = locale;
  }

  public build = async (luFiles: FileInfo[], qnaFiles: FileInfo[], allFiles: FileInfo[]) => {
    try {
      await this.createGeneratedDir();
      //do cross train before publish
      await this.crossTrain(luFiles, qnaFiles, allFiles);
      const { interruptionLuFiles, interruptionQnaFiles } = await this.getInterruptionFiles();
      await this.runLuBuild(interruptionLuFiles, allFiles);
      await this.runQnaBuild(interruptionQnaFiles);
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

  public setBuildConfig(config: IConfig, crossTrainConfig: CrossTrainConfig, downSamplingConfig: DownSamplingConfig) {
    this.config = config;
    this.crossTrainConfig = crossTrainConfig;
    this.downSamplingConfig = downSamplingConfig;
  }

  public get locale(): string {
    return this._locale;
  }

  public set locale(v: string) {
    this._locale = v;
  }

  /**
   * Orchestrator: Get available list of NLR models
   */
  public async runOrchestratorNlrList(): Promise<IOrchestratorNLRList> {
    return JSON.parse(await Orchestrator.nlrListAsync());
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
    await Orchestrator.nlrGetAsync(modelPath, nlrId, onProgress, onFinish);
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
  public async runOrchestratorBuild(
    files: FileInfo[],
    modelPath: string,
    isDialog = true,
    fullEmbedding = false
  ): Promise<IOrchestratorBuildOutput> {
    const luObjects = files
      .filter((fi) => fi.name.endsWith('.lu'))
      .map((fi) => ({
        id: fi.name,
        content: fi.content,
      }));

    return await Orchestrator.buildAsync(modelPath, luObjects, isDialog, null, fullEmbedding);
  }

  private async createGeneratedDir() {
    // clear previous folder
    await this.deleteDir(this.generatedFolderPath);
    //remove the cross train result
    await this.cleanCrossTrain();
    await this.storage.mkDir(this.generatedFolderPath);
  }

  private async crossTrain(luFiles: FileInfo[], qnaFiles: FileInfo[], allFiles: FileInfo[]) {
    const luContents = luFiles.map((file) => {
      return { content: file.content, id: file.name };
    });

    const qnaContents = qnaFiles.map((file) => {
      return { content: file.content, id: file.name };
    });

    const result = await crossTrainer.crossTrain(luContents, qnaContents, this.crossTrainConfig, {});

    await this.writeFiles(result.luResult);
    await this.writeFiles(result.qnaResult);
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

  private async writeFiles(crossTrainResult) {
    if (!(await this.storage.exists(this.interruptionFolderPath))) {
      await this.storage.mkDir(this.interruptionFolderPath);
    }
    await Promise.all(
      [...crossTrainResult.keys()].map(async (key: string) => {
        const fileName = Path.basename(key);
        const newFileId = Path.join(this.interruptionFolderPath, fileName);
        await this.storage.writeFile(newFileId, crossTrainResult.get(key).Content);
      })
    );
  }

  private async runLuBuild(files: FileInfo[], allFiles: FileInfo[]) {
    const config = await this._getConfig(files, 'lu');

    let luContents = await this.luBuilder.loadContents(config.models, {
      culture: config.fallbackLocal,
    });

    luContents = await this.downsizeUtterances(luContents);
    const authoringEndpoint = config.authoringEndpoint ?? `https://${config.region}.api.cognitive.microsoft.com`;

    const buildResult = await this.luBuilder.build(luContents, config.authoringKey, config.botName, {
      endpoint: authoringEndpoint,
      suffix: config.suffix,
      keptVersionCount: 10,
      isStaging: false,
    });

    await this.luBuilder.writeDialogAssets(buildResult, {
      force: true,
      out: this.generatedFolderPath,
    });
  }

  private async runQnaBuild(files: FileInfo[]) {
    const config = await this._getConfig(files, 'qna');

    const qnaContents = await this.qnaBuilder.loadContents(config.models, {
      culture: config.fallbackLocal,
    });

    if (qnaContents) {
      const subscriptionKeyEndpoint =
        config.endpoint ?? `https://${config.qnaRegion}.api.cognitive.microsoft.com/qnamaker/v4.0`;

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

  private _getConfig = async (files: FileInfo[], fileSuffix) => {
    if (!this.config) {
      throw new Error('Please complete your LUIS settings');
    }

    const config = {
      authoringKey: this.config.authoringKey || '',
      subscriptionKey: this.config.subscriptionKey || '',
      region: this.config.authoringRegion || '',
      qnaRegion: this.config.qnaRegion || this.config.authoringRegion || '',
      botName: this.config.name || '',
      suffix: this.config.environment || '',
      fallbackLocal: this.config.defaultLanguage || 'en-us',
      endpoint: this.config.endpoint || null,
      authoringEndpoint: this.config.authoringEndpoint || null,
      models: [] as string[],
    };

    //add all file after cross train
    let paths: string[] = [];
    paths = await this.storage.glob('**/*.' + fileSuffix, this.interruptionFolderPath);
    config.models = paths.map((filePath) => Path.join(this.interruptionFolderPath, filePath));

    const pathSet = new Set(paths);

    //add the file that are not in interruption folder.
    files.forEach((file) => {
      if (!pathSet.has(file.name)) {
        config.models.push(Path.resolve(this.botDir, file.relativePath));
      }
    });
    return config;
  };

  private async cleanCrossTrain() {
    await this.deleteDir(this.interruptionFolderPath);
  }
}
