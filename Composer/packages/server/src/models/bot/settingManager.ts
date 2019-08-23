import { has, set } from 'lodash';

import { Path } from '../../utility/path';
import { LocalDiskStorage } from '../storage/localDiskStorage';

import { DialogSetting } from './interface';

const keyword: any = ['OAuthInput.MicrosoftAppPassword', 'LuisConfig.authoringKey'];
const subPath = 'settings/csharp/appsettings.json';

export class SettingManager {
  private path: string;
  private storage: LocalDiskStorage;
  constructor(path: string) {
    this.path = Path.join(path, subPath);
    this.storage = new LocalDiskStorage();
  }
  public get = async () => {
    if (await this.storage.exists(this.path)) {
      const file = await this.storage.readFile(this.path);
      return JSON.parse(file);
    } else {
      return null;
    }
  };
  public set = async (config: DialogSetting) => {
    const dir = Path.dirname(this.path);
    if (!(await this.storage.exists(dir))) {
      await this.storage.mkDir(dir, { recursive: true });
    }
    this.filterSensitive(config);
    await this.storage.writeFile(this.path, JSON.stringify(config, null, 2));
  };
  private filterSensitive = (config: DialogSetting) => {
    if (typeof config !== 'object') {
      return config;
    }
    for (const key of keyword) {
      if (has(config, key)) {
        set(config, key, '****');
      }
    }
  };
}
