// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import isEqual from 'lodash/isEqual';
import { LuFile, DialogInfo } from '@bfc/indexers';

import { Path } from './../../utility/path';
import { IFileStorage } from './../storage/interface';
import { ILuisConfig } from './interface';
import log from './../../logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crossTrain = require('@bfcomposer/bf-lu/lib/parser/cross-train/cross-train.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const luBuild = require('@bfcomposer/bf-lu/lib/parser/lubuild/builder.js');

const DIALOGS_FOLDER = 'ComposerDialogs';
const GENERATEDFOLDER = 'generated';
const INTERUPTION = 'interuption';
const CROSS_TRAIN_CONFIG = 'mapping_rules.json';

export class LuPublisher {
  public botDir: string;
  public dialogsDir: string;
  public generatedFolderPath: string;
  public interuptionFolderPath: string;
  public storage: IFileStorage;
  public config: ILuisConfig | null = null;
  public crossTrainMapRule: { [key: string]: string } = {};

  private builder = new luBuild.Builder(message => {
    log(message);
  });

  constructor(path: string, storage: IFileStorage) {
    this.botDir = path;
    this.dialogsDir = Path.join(this.botDir, DIALOGS_FOLDER);
    this.generatedFolderPath = Path.join(this.dialogsDir, GENERATEDFOLDER);
    this.interuptionFolderPath = Path.join(this.generatedFolderPath, INTERUPTION);
    this.storage = storage;
  }

  public publish = async (luFiles: LuFile[]) => {
    try {
      await this._createGeneratedDir();

      await this.createCrossTrainConfig();

      //do cross train before publish
      await this._crossTrain();

      const config = await this._getConfig(luFiles);
      if (config.models.length === 0) {
        throw new Error('No luis file exist');
      }

      await this._runBuild(config);

      //remove the cross train result
      await this._cleanCrossTrain();
    } catch (error) {
      throw new Error(error.message ?? error.text ?? 'Error publishing to LUIS.');
    }
  };

  public getLuisConfig = () => this.config;

  public setLuisConfig = async (config: ILuisConfig) => {
    if (!isEqual(config, this.config)) {
      this.config = config;
      await this._deleteDir(this.generatedFolderPath);
    }
  };

  public setAuthoringKey = (key: string) => {
    if (this.config) {
      this.config.authoringKey = key;
    }
  };

  public setCrossTrainConfig = async (dialogs: DialogInfo[]) => {
    // ToDo: create real tree for cross train. Now add this data to test the bf-lu
    const rootDialog = dialogs.find(dialog => dialog.isRoot);
    if (rootDialog?.intentTriggers.length) {
      this.crossTrainMapRule = this._createTree(rootDialog, dialogs);
    }
  };

  //write config to generated folder
  public async createCrossTrainConfig() {
    await this.storage.writeFile(
      `${this.generatedFolderPath}/${CROSS_TRAIN_CONFIG}`,
      JSON.stringify(this.crossTrainMapRule)
    );
  }

  private _createPath(dialogPath: string) {
    const path = dialogPath.replace('.dialog', '.lu');
    const absolutePath = Path.join(this.botDir, path);
    const relativePath = Path.relative(this.generatedFolderPath, absolutePath);
    return relativePath;
  }

  private _createTree(dialog: DialogInfo, dialogs: DialogInfo[]) {
    let result = {};
    const key = this._createPath(dialog.relativePath);
    dialog.intentTriggers.forEach(temp => {
      const target = dialogs.find(dialog => dialog.id === temp.dialog);
      if (target && target.content?.recognizer) {
        if (!result[key]) result[key] = { triggers: {} };
        result[key].triggers[temp.intent] = this._createPath(target.relativePath);
        result = { ...result, ...this._createTree(target, dialogs) };
      }
    });

    if (dialog.isRoot && result[key]) result[key].rootDialog = true;
    return result;
  }

  private async _createGeneratedDir() {
    if (!(await this.storage.exists(this.generatedFolderPath))) {
      await this.storage.mkDir(this.generatedFolderPath);
    }
  }

  private async _crossTrain() {
    //await this.createCrossTrainConfig();
    const result = await crossTrain.train(
      this.dialogsDir,
      '_Interuption',
      `${this.generatedFolderPath}/${CROSS_TRAIN_CONFIG}`
    );
    await crossTrain.writeFiles(result.luResult, this.interuptionFolderPath);
  }

  private async _runBuild(luFiles: LuFile[]) {
    const config = await this._getConfig(luFiles);
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

  private _getConfig = async (luFiles: LuFile[]) => {
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
    const paths = await this.storage.glob('**/*.lu', this.interuptionFolderPath);
    luConfig.models = paths.map(filePath => Path.join(this.interuptionFolderPath, filePath));

    //add the lu file that are not in crossTrain config.
    luFiles.forEach(file => {
      if (!~paths.indexOf(`${file.id}.lu`)) {
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
    await this.storage.removeFile(`${this.generatedFolderPath}/${CROSS_TRAIN_CONFIG}`);
    await this._deleteDir(this.interuptionFolderPath);
  }
}
