// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import isEqual from 'lodash/isEqual';
import { runBuild } from '@bfcomposer/lubuild';
import { crossTrain } from '@bfcomposer/bf-lu/lib/parser/lubuild';
import { LuFile, DialogInfo } from '@bfc/indexers';

import { Path } from './../../utility/path';
import { IFileStorage } from './../storage/interface';
import { ILuisConfig, LuisStatus, FileUpdateType } from './interface';

const GENERATEDFOLDER = 'ComposerDialogs/generated';
const INTERUPTION = 'ComposerDialogs/generated/interuption';
const LU_STATUS_FILE = 'luis.status.json';
const CROSS_TRAIN_CONFIG = 'mapping_rules.json';
const DEFAULT_STATUS = {
  lastUpdateTime: 1,
  lastPublishTime: 0, // means unpublished
};

export class LuPublisher {
  public botDir: string;
  public generatedFolderPath: string;
  public interuptionFolderPath: string;
  public statusFile: string;
  public storage: IFileStorage;
  public config: ILuisConfig | null = null;
  public crossTrainMapRule: { [key: string]: string } = {};

  // key: filePath relative to bot dir
  // value: lastUpdateTime && lastPublishTime
  public status: { [key: string]: LuisStatus } = {};
  constructor(path: string, storage: IFileStorage) {
    this.botDir = path;
    this.generatedFolderPath = Path.join(this.botDir, GENERATEDFOLDER);
    this.interuptionFolderPath = Path.join(this.botDir, INTERUPTION);
    this.statusFile = Path.join(this.generatedFolderPath, LU_STATUS_FILE);
    this.storage = storage;
  }

  // load luis status from luis.status.json
  public loadStatus = async (files: string[] = []) => {
    if (await this.storage.exists(this.statusFile)) {
      const content = await this.storage.readFile(this.statusFile);
      this.status = JSON.parse(content);
    }

    // make sure all LU file have an initial value
    files.forEach(f => {
      if (!this.status[f]) {
        this.status[f] = { ...DEFAULT_STATUS }; // use ... ensure don't referred to the same object
      }
    });
    return this.status;
  };

  // reset status when config changed, because status don't represent the current config
  public resetStatus = () => {
    for (const key in this.status) {
      this.status[key] = { ...DEFAULT_STATUS };
    }
  };

  public saveStatus = async () => {
    if (!(await this.storage.exists(this.generatedFolderPath))) {
      await this.storage.mkDir(this.generatedFolderPath);
    }
    await this.storage.writeFile(this.statusFile, JSON.stringify(this.status, null, 2));
  };

  public onFileChange = async (relativePath: string, type: FileUpdateType) => {
    switch (type) {
      case FileUpdateType.CREATE:
        this.status[relativePath] = {
          lastUpdateTime: Date.now(),
          lastPublishTime: 0, // unpublished
        };
        break;
      case FileUpdateType.UPDATE:
        this.status[relativePath].lastUpdateTime = Date.now();
        break;
      case FileUpdateType.DELETE:
        delete this.status[relativePath];
        break;
    }
    await this.saveStatus();
  };

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

      await runBuild(config);

      //remove the cross train result
      await this._cleanCrossTrain();

      // update pubish status after sucessfully published
      const curTime = Date.now();
      luFiles.forEach(f => {
        this.status[f.relativePath].lastPublishTime = curTime;
      });

      await this.saveStatus();
    } catch (error) {
      throw new Error(error?.message ?? 'Error publishing to LUIS.');
    }
  };

  public getUnpublisedFiles = (files: LuFile[]) => {
    // unpublished means either
    // 1. there is no status tracking
    // 2. the status shows that lastPublishTime < lastUpdateTime
    return files.filter(f => {
      return (
        !this.status[f.relativePath] ||
        this.status[f.relativePath].lastPublishTime <= this.status[f.relativePath].lastUpdateTime
      );
    });
  };

  public checkLuisPublised = (files: LuFile[]) => {
    const unpublished = this.getUnpublisedFiles(files);
    return unpublished.length === 0;
  };

  public getLuisConfig = () => this.config;

  public setLuisConfig = async (config: ILuisConfig) => {
    if (!isEqual(config, this.config)) {
      this.config = config;
      await this._deleteDir(this.generatedFolderPath);
      this.resetStatus();
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
      this.botDir,
      '_Interuption',
      `${this.generatedFolderPath}/${CROSS_TRAIN_CONFIG}`
    );
    await crossTrain.writeFiles(result.luResult, this.interuptionFolderPath);
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
    const luConfig: any = { ...this.config };
    luConfig.models = [];
    luConfig.autodelete = true;
    luConfig.dialogs = true;
    luConfig.force = false;
    luConfig.folder = this.generatedFolderPath;
    //add all lu file after cross train
    const paths = await this.storage.glob('**/*.lu', this.interuptionFolderPath);
    luConfig.models = paths.map(filePath => Path.join(this.interuptionFolderPath, filePath));

    //add the lu file that are not in crossTrain config.
    luFiles.forEach(file => {
      if (~paths.indexOf(`${file.id}.lu`)) {
        luConfig.models.push(Path.resolve(this.botDir, file.relativePath));
      }
    });

    return luConfig;
  };

  private async _cleanCrossTrain() {
    await this.storage.removeFile(`${this.generatedFolderPath}/${CROSS_TRAIN_CONFIG}`);
    await this._deleteDir(this.interuptionFolderPath);
  }
}
