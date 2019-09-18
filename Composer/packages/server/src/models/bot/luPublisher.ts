import { isEqual } from 'lodash';
import { runBuild } from 'lubuild';

import { Path } from './../../utility/path';
import { IFileStorage } from './../storage/interface';
import { LUFile, ILuisConfig, LuisStatus, FileUpdateType } from './interface';

const GENERATEDFOLDER = 'generated';
const LU_STATUS_FILE = 'luis.status.json';

export class LuPublisher {
  public botDir: string;
  public generatedFolderPath: string;
  public statusFile: string;
  public storage: IFileStorage;
  public config: ILuisConfig | null = null;
  public previousConfig: ILuisConfig | null = null;

  // key: filePath relative to bot dir
  // value: lastUpdateTime && lastPublishTime
  public status: { [key: string]: LuisStatus } = {};

  constructor(path: string, storage: IFileStorage) {
    this.botDir = path;
    this.generatedFolderPath = Path.join(this.botDir, GENERATEDFOLDER);
    this.statusFile = Path.join(this.generatedFolderPath, LU_STATUS_FILE);
    this.storage = storage;
  }

  public isConfigEqual = () => {
    return JSON.stringify(this.config) === JSON.stringify(this.previousConfig);
  };

  // load luis status from luis.status.json
  public loadStatus = async (files: string[] = []) => {
    if (await this.storage.exists(this.statusFile)) {
      const content = await this.storage.readFile(this.statusFile);
      this.status = JSON.parse(content);
    }

    // make sure all LU file have an initial value
    files.forEach(f => {
      if (!this.status[f]) {
        this.status[f] = {
          lastUpdateTime: 1,
          lastPublishTime: 0, // means unpublished
        };
      }
    });
    return this.status;
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

  public publish = async (luFiles: LUFile[]) => {
    const config = this._getConfig(luFiles);
    if (config.models.length === 0) {
      throw new Error('No luis file exist');
    }
    const curTime = Date.now();
    try {
      await runBuild(config);

      // update pubish status after sucessfully published
      luFiles.forEach(f => {
        this.status[f.relativePath].lastPublishTime = curTime;
      });
      await this.saveStatus();

      this.previousConfig = this.config ? { ...this.config } : null;
    } catch (error) {
      console.error(error);
      throw new Error(error.body.error.message ? error.body.error.message : 'Error publishing to LUIS.');
    }

    await this._copyDialogsToTargetFolder(config);
  };

  public getUnpublisedFiles = async (files: LUFile[]) => {
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

  public checkLuisPublised = async (files: LUFile[]) => {
    const unpublished = await this.getUnpublisedFiles(files);
    return unpublished.length === 0;
  };

  public getLuisConfig = () => this.config;

  public setLuisConfig = async (config: ILuisConfig) => {
    if (!isEqual(config, this.config)) {
      this.config = config;
      if (!(await this.storage.exists(this._getSettingPath(config)))) {
        await this._deleteGenerated(this.generatedFolderPath);
      }
    }
  };

  public setAuthoringKey = async (key: string) => {
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

  private _copyDialogsToTargetFolder = async (config: any) => {
    const defaultLanguage = config.defaultLanguage;
    await config.models.forEach(async (filePath: string) => {
      const baseName = Path.basename(filePath, '.lu');
      const rootPath = Path.dirname(filePath);
      const currentPath = `${filePath}.dialog`;
      const targetPath = Path.join(this.generatedFolderPath, `${baseName}.lu.dialog`);
      const currentVariantPath = Path.join(rootPath, `${baseName}.${defaultLanguage}.lu.dialog`);
      const targetVariantPath = Path.join(this.generatedFolderPath, `${baseName}.${defaultLanguage}.lu.dialog`);
      await this.storage.copyFile(currentPath, targetPath);
      await this.storage.copyFile(currentVariantPath, targetVariantPath);
      await this.storage.removeFile(currentPath);
      await this.storage.removeFile(currentVariantPath);
    });
  };

  private _getSettingPath = (config: ILuisConfig | null) => {
    if (config === null) return '';
    return Path.join(this.generatedFolderPath, `luis.settings.${config.environment}.${config.authoringRegion}.json`);
  };

  private _getConfig = (luFiles: LUFile[]) => {
    const luConfig: any = { ...this.config };
    luConfig.models = [];
    luConfig.autodelete = true;
    luConfig.dialogs = true;
    luConfig.force = false;
    luConfig.folder = this.generatedFolderPath;
    luFiles.forEach(file => {
      luConfig.models.push(Path.resolve(this.botDir, file.relativePath));
    });

    return luConfig;
  };
}
