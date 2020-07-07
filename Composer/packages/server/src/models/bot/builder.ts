// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';

import { Path } from '../../utility/path';
import { IFileStorage } from '../storage/interface';
import log from '../../logger';

import { ComposerReservoirSampler } from './sampler/ReservoirSampler';
import { ComposerBootstrapSampler } from './sampler/BootstrapSampler';
import { IConfig } from './interface';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crossTrainer = require('@microsoft/bf-lu/lib/parser/cross-train/crossTrainer.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qnaBuild = require('@microsoft/bf-lu/lib/parser/qnabuild/builder.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LuisBuilder = require('@microsoft/bf-lu/lib/parser/luis/luisBuilder');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const luisToLuContent = require('@microsoft/bf-lu/lib/parser/luis/luConverter');

const GENERATEDFOLDER = 'generated';
const INTERUPTION = 'interuption';

export interface ICrossTrainConfig {
  rootIds: string[];
  triggerRules: { [key: string]: any };
  intentName: string;
  verbose: boolean;
  botName: string;
}

export interface IDownSamplingConfig {
  maxImbalanceRatio: number;
  maxUtteranceAllowed: number;
}

export class Builder {
  public botDir: string;
  public dialogsDir: string;
  public generatedFolderPath: string;
  public interruptionFolderPath: string;
  public storage: IFileStorage;
  public config: IConfig | null = null;
  public downSamplingConfig: IDownSamplingConfig = { maxImbalanceRatio: 0, maxUtteranceAllowed: 0 };
  private _locale: string;

  public crossTrainConfig: ICrossTrainConfig = {
    rootIds: [],
    triggerRules: {},
    intentName: '_Interruption',
    verbose: true,
    botName: '',
  };

  private luBuilder = new luBuild.Builder((message) => {
    log(message);
  });
  private qnaBuilder = new qnaBuild.Builder((message) => {
    log(message);
  });

  constructor(path: string, storage: IFileStorage, locale: string) {
    this.botDir = path;
    this.dialogsDir = this.botDir;
    this.generatedFolderPath = Path.join(this.dialogsDir, GENERATEDFOLDER);
    this.interruptionFolderPath = Path.join(this.generatedFolderPath, INTERUPTION);
    this.storage = storage;
    this._locale = locale;
  }

  public build = async (luFiles: FileInfo[], qnaFiles: FileInfo[]) => {
    try {
      await this.createGeneratedDir();

      //do cross train before build
      await this.crossTrain(luFiles, qnaFiles);

      const { interruptionLuFiles, interruptionQnaFiles } = await this.getInterruptionFiles();
      await this.runLuBuild(interruptionLuFiles);
      await this.runQnaBuild(interruptionQnaFiles);
      //remove the cross train result
      await this.cleanCrossTrain();
    } catch (error) {
      throw new Error(error.message ?? error.text ?? 'Error building to LUIS.');
    }
  };

  public getQnaEndpointKey = async (subscriptKey: string) => {
    const subscriptKeyEndpoint = `https://${this.config?.authoringRegion}.api.cognitive.microsoft.com/qnamaker/v4.0`;
    const endpointKey = await this.qnaBuilder.getEndpointKeys(subscriptKey, subscriptKeyEndpoint);
    return endpointKey.primaryEndpointKey;
  };
  public setBuildConfig(config: IConfig, crossTrainConfig: ICrossTrainConfig, downSamplingConfig: IDownSamplingConfig) {
    this.config = config;
    this.crossTrainConfig = { ...crossTrainConfig, botName: this.config.name };
    this.downSamplingConfig = downSamplingConfig;
  }

  public get locale(): string {
    return this._locale;
  }

  public set locale(v: string) {
    this._locale = v;
  }

  private async createGeneratedDir() {
    // clear previous folder
    await this.deleteDir(this.generatedFolderPath);
    await this.storage.mkDir(this.generatedFolderPath);
  }

  private needCrossTrain() {
    return this.crossTrainConfig.rootIds.length > 0;
  }

  private async crossTrain(luFiles: FileInfo[], qnaFiles: FileInfo[]) {
    if (!this.needCrossTrain()) return;
    const luContents = luFiles.map((file) => {
      return { content: file.content, id: file.name };
    });

    const qnaContents = qnaFiles.map((file) => {
      return { content: file.content, id: file.name };
    });
    const result = await crossTrainer.crossTrain(luContents, qnaContents, this.crossTrainConfig);

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
      this.downSamplingConfig.maxImbalanceRatio
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
        const result = await LuisBuilder.fromLUAsync(luContent.content);
        const sampledResult = this.doDownSampling(result);
        const content = luisToLuContent(sampledResult);
        return { ...luContent, content };
      })
    );
  }

  private async writeFiles(crossTrainResult) {
    if (!(await this.storage.exists(this.interruptionFolderPath))) {
      await this.storage.mkDir(this.interruptionFolderPath);
    }
    for (const key of crossTrainResult.keys()) {
      const fileName = Path.basename(key);
      const newFileId = Path.join(this.interruptionFolderPath, fileName);
      await this.storage.writeFile(newFileId, crossTrainResult.get(key).Content);
    }
  }

  private async runLuBuild(files: FileInfo[]) {
    const config = await this._getConfig(files, 'lu');
    if (config.models.length === 0) {
      throw new Error('No LUIS files exist');
    }

    const loadResult = await this.luBuilder.loadContents(
      config.models,
      config.fallbackLocal,
      config.suffix,
      config.region
    );
    loadResult.luContents = await this.downsizeUtterances(loadResult.luContents);
    const authoringEndpoint = config.authoringEndpoint ?? `https://${config.region}.api.cognitive.microsoft.com`;

    const buildResult = await this.luBuilder.build(
      loadResult.luContents,
      loadResult.recognizers,
      config.authoringKey,
      authoringEndpoint,
      config.botName,
      config.suffix,
      config.fallbackLocal,
      false,
      loadResult.multiRecognizers,
      loadResult.settings,
      loadResult.crosstrainedRecognizers,
      'crosstrained'
    );
    await this.luBuilder.writeDialogAssets(buildResult, true, this.generatedFolderPath);
  }

  private async runQnaBuild(files: FileInfo[]) {
    const config = await this._getConfig(files, 'qna');
    if (config.models.length === 0) {
      throw new Error('No QnA files exist');
    }

    const loadResult = await this.qnaBuilder.loadContents(
      config.models,
      config.botName,
      config.suffix,
      config.region,
      config.fallbackLocal
    );
    const subscriptKeyEndpoint =
      config.endpoint ?? `https://${config.region}.api.cognitive.microsoft.com/qnamaker/v4.0`;

    const buildResult = await this.qnaBuilder.build(
      loadResult.qnaContents,
      loadResult.recognizers,
      config.subscriptKey,
      subscriptKeyEndpoint,
      config.botName,
      config.suffix,
      config.fallbackLocal,
      loadResult.multiRecognizer,
      loadResult.settings,
      loadResult.crosstrainedRecognizer,
      'crosstrained'
    );
    await this.qnaBuilder.writeDialogAssets(buildResult, true, this.generatedFolderPath);
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
      subscriptKey: this.config.subscriptKey || '',
      region: this.config.authoringRegion || '',
      botName: this.config.name || '',
      suffix: this.config.environment || '',
      fallbackLocal: this.config.defaultLanguage || 'en-us',
      endpoint: this.config.endpoint || null,
      authoringEndpoint: this.config.authoringEndpoint || null,
      models: [] as string[],
    };

    //add all lu file after cross train
    let paths: string[] = [];
    if (this.needCrossTrain()) {
      paths = await this.storage.glob('**/*.' + fileSuffix, this.interruptionFolderPath);
      config.models = paths.map((filePath) => Path.join(this.interruptionFolderPath, filePath));
    }

    const pathSet = new Set(paths);

    //add the lu file that are not in interruption folder.
    files.forEach((file) => {
      if (!pathSet.has(file.name)) {
        config.models.push(Path.resolve(this.botDir, file.relativePath));
      }
    });
    return config;
  };

  private async cleanCrossTrain() {
    if (!this.needCrossTrain()) return;
    await this.deleteDir(this.interruptionFolderPath);
  }
}
