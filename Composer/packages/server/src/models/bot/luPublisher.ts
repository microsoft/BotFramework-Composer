// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import isEqual from 'lodash/isEqual';
import { luBuild } from '@bfcomposer/bf-lu/lib/parser/lubuild';
import { LuFile } from '@bfc/indexers';

import { Path } from './../../utility/path';
import { IFileStorage } from './../storage/interface';
import { ILuisConfig, LuisStatus, FileUpdateType } from './interface';
import log from './../../logger';
const GENERATEDFOLDER = 'generated';
const LU_STATUS_FILE = 'luis.status.json';
const DEFAULT_STATUS = {
  lastUpdateTime: 1,
  lastPublishTime: 0, // means unpublished
};
export class LuPublisher {
  public botDir: string;
  public generatedFolderPath: string;
  public statusFile: string;
  public storage: IFileStorage;
  public config: ILuisConfig | null = null;

  // key: filePath relative to bot dir
  // value: lastUpdateTime && lastPublishTime
  public status: { [key: string]: LuisStatus } = {};

  private builder = new luBuild.Builder(message => {
    log(message);
  });

  constructor(path: string, storage: IFileStorage) {
    this.botDir = path;
    this.generatedFolderPath = Path.join(this.botDir, GENERATEDFOLDER);
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
    if (!luFiles.length) {
      throw new Error('No luis file exist');
    }
    const config = this._getConfig();
    const curTime = Date.now();
    try {
      const loadResult = await this._loadLuConatents(luFiles);
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

      // update pubish status after sucessfully published
      luFiles.forEach(f => {
        this.status[f.relativePath].lastPublishTime = curTime;
      });
      await this.saveStatus();
      await this.builder.writeDialogAssets(buildResult, true, this.generatedFolderPath);
    } catch (error) {
      throw new Error(error.body?.error?.message || error.message || 'Error publishing to LUIS.');
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
      await this._deleteGenerated(this.generatedFolderPath);
      this.resetStatus();
    }
  };

  public setAuthoringKey = (key: string) => {
    if (this.config) {
      this.config.authoringKey = key;
    }
  };
  //delete files in generated folder
  private async _deleteGenerated(path: string) {
    if (await this.storage.exists(path)) {
      const files = await this.storage.readDir(path);
      for (const file of files) {
        const curPath = Path.join(path, file);
        if ((await this.storage.stat(curPath)).isDir) {
          await this._deleteGenerated(curPath);
        } else {
          await this.storage.removeFile(curPath);
        }
      }
    }
  }

  private _getConfig = () => {
    const luConfig = {
      authoringKey: this.config?.authoringKey || '',
      region: this.config?.authoringRegion || '',
      botName: this.config?.name || '',
      suffix: this.config?.environment || '',
      fallbackLocal: this.config?.defaultLanguage || 'en-us',
    };
    return luConfig;
  };

  private _loadLuConatents = async (luFiles: LuFile[]) => {
    const pathList = luFiles.map(file => {
      return Path.resolve(this.botDir, file.relativePath);
    });

    return await this.builder.loadContents(
      pathList,
      this.config?.defaultLanguage || '',
      this.config?.environment || '',
      this.config?.authoringRegion || ''
    );
  };
}
