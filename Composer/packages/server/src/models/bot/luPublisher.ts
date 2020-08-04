// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, ILuisConfig } from '@bfc/shared';

import { Path } from '../../utility/path';
import { IFileStorage } from '../storage/interface';
import log from '../../logger';

import { ComposerReservoirSampler } from './sampler/ReservoirSampler';
import { ComposerBootstrapSampler } from './sampler/BootstrapSampler';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crossTrainer = require('@microsoft/bf-lu/lib/parser/cross-train/crossTrainer.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
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
}

export interface IDownSamplingConfig {
  maxImbalanceRatio: number;
  maxUtteranceAllowed: number;
}

export class LuPublisher {
  public botDir: string;
  public dialogsDir: string;
  public generatedFolderPath: string;
  public interruptionFolderPath: string;
  public storage: IFileStorage;
  public config: ILuisConfig | null = null;
  public downSamplingConfig: IDownSamplingConfig = { maxImbalanceRatio: 0, maxUtteranceAllowed: 0 };
  private _locale: string;

  public crossTrainConfig: ICrossTrainConfig = {
    rootIds: [],
    triggerRules: {},
    intentName: '_Interruption',
    verbose: true,
  };

  private builder = new luBuild.Builder((message) => {
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

  public publish = async (files: FileInfo[]) => {
    try {
      await this.createGeneratedDir();

      //do cross train before publish
      await this.crossTrain(files);

      await this.runBuild(files);
      //remove the cross train result
      await this.cleanCrossTrain();
    } catch (error) {
      throw new Error(error.message ?? error.text ?? 'Error publishing to LUIS.');
    }
  };

  public setPublishConfig(
    luisConfig: ILuisConfig,
    crossTrainConfig: ICrossTrainConfig,
    downSamplingConfig: IDownSamplingConfig
  ) {
    this.config = luisConfig;
    this.crossTrainConfig = crossTrainConfig;
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

  private async crossTrain(files: FileInfo[]) {
    if (!this.needCrossTrain()) return;
    const luContents = files.map((file) => {
      return { content: file.content, id: file.name };
    });

    const result = await crossTrainer.crossTrain(luContents, [], this.crossTrainConfig);

    await this.writeFiles(result.luResult);
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

  private async runBuild(files: FileInfo[]) {
    const config = await this._getConfig(files);
    if (config.models.length === 0) {
      throw new Error('No LUIS files exist');
    }

    const loadResult = await this._loadLuContents(config.models);
    loadResult.luContents = await this.downsizeUtterances(loadResult.luContents);
    const authoringEndpoint = config.authoringEndpoint ?? `https://${config.region}.api.cognitive.microsoft.com`;

    const buildResult = await this.builder.build(
      loadResult.luContents,
      loadResult.recognizers,
      config.authoringKey,
      authoringEndpoint,
      config.botName,
      config.suffix,
      config.fallbackLocal,
      true,
      false,
      loadResult.multiRecognizers,
      loadResult.settings
    );
    await this.builder.writeDialogAssets(buildResult, true, this.generatedFolderPath);
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

  private _getConfig = async (files: FileInfo[]) => {
    if (!this.config) {
      throw new Error('Please complete your LUIS settings');
    }

    const luConfig = {
      authoringKey: this.config.authoringKey || '',
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
      paths = await this.storage.glob('**/*.lu', this.interruptionFolderPath);
      luConfig.models = paths.map((filePath) => Path.join(this.interruptionFolderPath, filePath));
    }

    const pathSet = new Set(paths);

    //add the lu file that are not in interruption folder.
    files.forEach((file) => {
      if (!pathSet.has(file.name)) {
        luConfig.models.push(Path.resolve(this.botDir, file.relativePath));
      }
    });
    return luConfig;
  };

  private _loadLuContents = async (paths: string[]) => {
    return await this.builder.loadContents(
      paths,
      this._locale,
      this.config?.environment || '',
      this.config?.authoringRegion || ''
    );
  };

  private async cleanCrossTrain() {
    if (!this.needCrossTrain()) return;
    await this.deleteDir(this.interruptionFolderPath);
  }
}
