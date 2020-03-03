// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Path } from '../../utility/path';
import { IFileStorage } from '../storage/interface';
import StorageService from '../../services/storage';
import { UserIdentity } from '../../services/pluginLoader';
import log from '../../logger';

import { ISettingManager, OBFUSCATED_VALUE } from '.';

const debug = log.extend('file-settings-manager');

// TODO: this causes tests to fail
const subPath = 'settings/appsettings.json';

export class FileSettingManager implements ISettingManager {
  private basePath: string;
  protected storage: IFileStorage;

  constructor(basePath: string, user?: UserIdentity) {
    this.basePath = basePath;
    // todo: do we need to pass in a storage client id? there can only be one at a time.
    this.storage = StorageService.getStorageClient('default', user);
  }

  public get = async (slot = '', obfuscate = false): Promise<any> => {
    this.validateSlot(slot);

    const path = this.getPath(slot);
    const settings = await this._getFromStorage(path, slot);

    return obfuscate ? this.obfuscateValues(settings) : settings;
  };

  private _getFromStorage = async (path: string, slot: string) => {
    if (await this.storage.exists(path)) {
      const file = await this.storage.readFile(path);
      return JSON.parse(file);
    } else {
      // does not have setting file, return default value
      const defaultValue = this.createDefaultSettings();
      await this.set(slot, defaultValue);
      return defaultValue;
    }
  };

  protected createDefaultSettings = (): any => {
    return {};
  };

  public set = async (slot: string, settings: any): Promise<void> => {
    this.validateSlot(slot);

    const path = this.getPath(slot);

    const dir = Path.dirname(path);
    if (!(await this.storage.exists(dir))) {
      debug('Storage path does not exist. Creating directory now: %s', dir);
      await this.storage.mkDir(dir, { recursive: true });
    }
    await this.storage.writeFile(path, JSON.stringify(settings, null, 2));
  };

  private obfuscateValues = (obj: any): any => {
    if (obj) {
      const type = typeof obj;
      if (type === 'object') {
        if (Array.isArray(obj)) {
          const result: any[] = [];
          obj.forEach(x => result.push(this.obfuscateValues(x)));
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

  protected validateSlot = (_: string): void => {};

  protected getPath = (slot: string): string => {
    if (slot && slot.length > 0) {
      return Path.join(this.basePath, slot, subPath);
    } else {
      return Path.join(this.basePath, subPath);
    }
  };
}
