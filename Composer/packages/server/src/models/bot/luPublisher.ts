// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import isEqual from 'lodash/isEqual';
import { FileInfo } from '@bfc/indexers';

import { Path } from './../../utility/path';
import { IFileStorage } from './../storage/interface';
import { ILuisConfig } from './interface';
import log from './../../logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crossTrainer = require('@microsoft/bf-lu/lib/parser/cross-train/crossTrainer.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');

const GENERATEDFOLDER = 'generated';
const INTERUPTION = 'interuption';

export interface ICrossTrainConfig {
  rootIds: string[];
  triggerRules: { [key: string]: any };
  intentName: string;
  verbose: boolean;
}

export class LuPublisher {
  public botDir: string;
  public dialogsDir: string;
  public generatedFolderPath: string;
  public interuptionFolderPath: string;
  public storage: IFileStorage;
  public config: ILuisConfig | null = null;
  public crossTrainConfig: ICrossTrainConfig = {
    rootIds: [],
    triggerRules: {},
    intentName: '_Interruption',
    verbose: true,
  };

  private builder = new luBuild.Builder(message => {
    log(message);
  });

  constructor(path: string, storage: IFileStorage) {
    this.botDir = path;
    this.dialogsDir = this.botDir;
    this.generatedFolderPath = Path.join(this.dialogsDir, GENERATEDFOLDER);
    this.interuptionFolderPath = Path.join(this.generatedFolderPath, INTERUPTION);
    this.storage = storage;
  }

  public publish = async (files: FileInfo[]) => {
    try {
      await this._createGeneratedDir();

      //do cross train before publish
      await this._crossTrain(files);

      await this._runBuild(files);
      //remove the cross train result
      await this._cleanCrossTrain();
    } catch (error) {
      throw new Error(error.message ?? error.text ?? 'Error publishing to LUIS.');
    }
  };

  public getLuisConfig = () => this.config;

  public setLuisConfig = (config: ILuisConfig) => {
    if (!isEqual(config, this.config)) {
      this.config = config;
    }
  };

  public setAuthoringKey = (key: string) => {
    if (this.config) {
      this.config.authoringKey = key;
    }
  };

  public setCrossTrainConfig = (crossTrainConfig: ICrossTrainConfig) => {
    if (crossTrainConfig) this.crossTrainConfig = crossTrainConfig;
  };

  private async _createGeneratedDir() {
    // clear previous folder
    await this._deleteDir(this.generatedFolderPath);
    await this.storage.mkDir(this.generatedFolderPath);
  }

  private _needCrossTrain() {
    return !!this.crossTrainConfig.rootIds.length;
  }

  private async _crossTrain(files: FileInfo[]) {
    if (!this._needCrossTrain()) return;
    const luContents = files.map(file => {
      return { content: file.content, id: file.name };
    });

    const result = await crossTrainer.crossTrain(luContents, [], this.crossTrainConfig);

    await this._writeFiles(result.luResult);
  }

  private async _writeFiles(crossTrainResult) {
    if (!(await this.storage.exists(this.interuptionFolderPath))) {
      await this.storage.mkDir(this.interuptionFolderPath);
    }
    for (const key of crossTrainResult.keys()) {
      const fileName = Path.basename(key);
      const newFileId = Path.join(this.interuptionFolderPath, fileName);
      await this.storage.writeFile(newFileId, crossTrainResult.get(key).Content);
    }
  }

  private async _runBuild(files: FileInfo[]) {
    const config = await this._getConfig(files);
    if (config.models.length === 0) {
      throw new Error('No luis file exist');
    }
    const loadResult = await this._loadLuConatents(config.models);
    const buildResult = await this.builder.build(
      loadResult.luContents,
      loadResult.recognizers,
      config.authoringKey,
      config.region,
      config.botName,
      config.suffix,
      config.fallbackLocal,
      false,
      loadResult.multiRecognizers,
      loadResult.settings
    );
    await this.builder.writeDialogAssets(buildResult, true, this.generatedFolderPath);
  }

  //delete files in generated folder
  private async _deleteDir(path: string) {
    if (await this.storage.exists(path)) {
      const files = await this.storage.readDir(path);
      for (const file of files) {
        const curPath = Path.join(path, file);
        if ((await this.storage.stat(curPath)).isDir) {
          await this._deleteDir(curPath);
        } else {
          await this.storage.removeFile(curPath);
        }
      }
      await this.storage.rmDir(path);
    }
  }

  private _getConfig = async (files: FileInfo[]) => {
    if (!this.config) {
      throw new Error('Please complete your Luis settings');
    }

    const luConfig: any = {
      authoringKey: this.config.authoringKey || '',
      region: this.config.authoringRegion || '',
      botName: this.config.name || '',
      suffix: this.config.environment || '',
      fallbackLocal: this.config.defaultLanguage || 'en-us',
    };

    luConfig.models = [];
    //add all lu file after cross train
    let paths: string[] = [];
    if (this._needCrossTrain()) {
      paths = await this.storage.glob('**/*.lu', this.interuptionFolderPath);
      luConfig.models = paths.map(filePath => Path.join(this.interuptionFolderPath, filePath));
    }

    //add the lu file that are not in interuption folder.
    files.forEach(file => {
      if (!~paths.indexOf(file.name)) {
        luConfig.models.push(Path.resolve(this.botDir, file.relativePath));
      }
    });
    return luConfig;
  };

  private _loadLuConatents = async (paths: string[]) => {
    return await this.builder.loadContents(
      paths,
      this.config?.defaultLanguage || '',
      this.config?.environment || '',
      this.config?.authoringRegion || ''
    );
  };

  private async _cleanCrossTrain() {
    if (!this._needCrossTrain()) return;
    await this._deleteDir(this.interuptionFolderPath);
  }
}
