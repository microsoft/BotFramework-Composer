// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import { LuFile, DialogInfo } from '@bfc/indexers';

import { Path } from './../../utility/path';
import { IFileStorage } from './../storage/interface';
import { ILuisConfig } from './interface';
import log from './../../logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crossTrainer = require('@bfcomposer/bf-lu/lib/parser/cross-train/crossTrainer.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const luBuild = require('@bfcomposer/bf-lu/lib/parser/lubuild/builder.js');

const DIALOGS_FOLDER = 'ComposerDialogs';
const GENERATEDFOLDER = 'generated';
const INTERUPTION = 'interuption';

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

      //do cross train before publish
      await this._crossTrain(luFiles);

      await this._runBuild(luFiles);

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

  public setCrossTrainConfig = (dialogs: DialogInfo[]) => {
    // ToDo: create real tree for cross train. Now add this data to test the bf-lu
    const rootDialog = dialogs.find(dialog => dialog.isRoot);
    if (rootDialog?.intentTriggers.length) {
      this.crossTrainMapRule = this._createTree(rootDialog, dialogs);
    }
  };

  // //write config to generated folder
  // private async _createCrossTrainConfig() {
  //   await this.storage.writeFile(
  //     `${this.generatedFolderPath}/${CROSS_TRAIN_CONFIG}`,
  //     JSON.stringify(this.crossTrainMapRule)
  //   );
  // }

  private _createPath(dialogPath: string) {
    const path = dialogPath.replace('.dialog', '.lu');
    const absolutePath = Path.join(this.botDir, path);
    const relativePath = Path.relative(this.generatedFolderPath, absolutePath);
    return relativePath;
  }

  //generate the cross-train config
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

  private _needCrossTrain() {
    return !!keys(this.crossTrainMapRule).length;
  }

  private async _crossTrain(luFiles: LuFile[]) {
    if (!this._needCrossTrain()) return;
    const luContents = luFiles.map(file => {
      return { content: file.content, path: Path.join(this.botDir, file.relativePath) };
    });
    const configContent = crossTrainer.getConfigObject(
      { path: this.interuptionFolderPath, content: JSON.stringify(this.crossTrainMapRule) },
      '_Interuption'
    );
    const result = await crossTrainer.crossTrain(luContents, [], configContent);

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
    let paths: string[] = [];
    if (this._needCrossTrain()) {
      paths = await this.storage.glob('**/*.lu', this.interuptionFolderPath);
      luConfig.models = paths.map(filePath => Path.join(this.interuptionFolderPath, filePath));
    }

    //add the lu file that are not in interuption folder.
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
    if (!this._needCrossTrain()) return;
    await this._deleteDir(this.interuptionFolderPath);
  }
}
