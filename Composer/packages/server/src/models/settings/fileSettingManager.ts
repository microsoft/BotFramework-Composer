// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UserIdentity } from '@bfc/extension';

import { Path } from '../../utility/path';
import { IFileStorage } from '../storage/interface';
import StorageService from '../../services/storage';
import log from '../../logger';

import { ISettingManager, OBFUSCATED_VALUE } from './interface';

const debug = log.extend('file-settings-manager');

// TODO: this causes tests to fail
const subPath = 'settings/appsettings.json';
const fileName = 'appsettings.json';

export class FileSettingManager implements ISettingManager {
  private basePath: string;
  protected storage: IFileStorage;

  constructor(basePath: string, user?: UserIdentity) {
    this.basePath = basePath;
    // todo: do we need to pass in a storage client id? there can only be one at a time.
    this.storage = StorageService.getStorageClient('default', user);
  }

  public async get(obfuscate = false): Promise<any> {
    const path = this.getPath();
    const settings = await this._getFromStorage(path);

    return obfuscate ? this.obfuscateValues(settings) : settings;
  }

  private _getFromStorage = async (path: string) => {
    if (await this.storage.exists(path)) {
      const file = await this.storage.readFile(path);
      return JSON.parse(file);
    } else {
      // does not have setting file, return default value
      const defaultValue = this.createDefaultSettings();
      await this.set(defaultValue);
      return defaultValue;
    }
  };

  protected createDefaultSettings = (): any => {
    return {};
  };

  public set = async (settings: any): Promise<void> => {
    const path = this.getPath();

    const dir = Path.dirname(path);
    if (!(await this.storage.exists(dir))) {
      debug('Storage path does not exist. Creating directory now: %s', dir);
      await this.storage.mkDir(dir, { recursive: true });
    }
    await this.storage.writeFile(path, JSON.stringify(settings, null, 2));
  };

  public getFileName = () => fileName;

  private obfuscateValues = (obj: any): any => {
    if (obj) {
      const type = typeof obj;
      if (type === 'object') {
        if (Array.isArray(obj)) {
          const result: any[] = [];
          obj.forEach((x) => result.push(this.obfuscateValues(x)));
          return result;
        } else {
          const result: any = {};
          for (const p in obj) {
            result[p] = this.obfuscateValues(obj[p]);
          }
          return result;
        }
      }
    }
    return OBFUSCATED_VALUE;
  };

  protected getPath = (): string => {
    return Path.join(this.basePath, subPath);
  };
}
