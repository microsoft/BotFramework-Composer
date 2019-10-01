import { Path } from '../../utility/path';
import { LocalDiskStorage } from '../storage/localDiskStorage';
import { DialogSetting, ISettingManager } from './interface';

const subPath = 'settings/appsettings.json';
const unknown = 'unknown';

const defaultSetting: DialogSetting = {
  MicrosoftAppPassword: '',
  MicrosoftAppId: '',
  luis: {
    name: '',
    authoringKey: '',
    endpointKey: '',
    authoringRegion: 'westus',
    defaultLanguage: 'en-us',
    environment: 'composer',
  },
};

export class LocalSettingManager implements ISettingManager {
  private basePath: string;
  private storage: LocalDiskStorage;
  private settings: any;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.storage = new LocalDiskStorage();
    this.settings = {};
  }

  public get = async (
    hideValues: boolean,
    env?: 'editing' | 'integration' | 'production'
  ): Promise<DialogSetting | null> => {
    let settings: DialogSetting;
    let envKey = env ? env : unknown;

    if (env && this.settings[env]) {
      settings = this.settings;
    } else {
      let path = this.getPath(env);
      settings = await this._getFromStorage(path);
      this.settings[envKey] = settings;
    }

    return hideValues ? this.obfuscateValues(settings) : settings;
  };

  private _getFromStorage = async (path: string) => {
    if (await this.storage.exists(path)) {
      const file = await this.storage.readFile(path);
      return JSON.parse(file);
    } else {
      // does not have setting file, return default value
      await this.set(defaultSetting);
      return defaultSetting;
    }
  };

  public set = async (settings: DialogSetting, env?: 'editing' | 'integration' | 'production'): Promise<void> => {
    let path = this.getPath(env);

    const dir = Path.dirname(path);
    if (!(await this.storage.exists(dir))) {
      await this.storage.mkDir(dir, { recursive: true });
    }
    await this.storage.writeFile(path, JSON.stringify(settings, null, 2));
  };

  private obfuscateValues = (obj: any): any => {
    if (obj) {
      let type = typeof obj;
      if (type === 'object') {
        if (Object.prototype.toString.call(obj) === '[object Array]') {
          let result: any[] = [];
          (<Array<any>>obj).forEach(x => result.push(this.obfuscateValues(x)));
          return result;
        } else {
          let result: any = {};
          for (let p in obj) {
            result[p] = this.obfuscateValues(obj[p]);
          }
          return result;
        }
      }
    }
    return '*****';
  };

  private getPath = (env?: 'editing' | 'integration' | 'production'): string => {
    return env ? Path.join(this.basePath, env, subPath) : Path.join(this.basePath, subPath);
  };
}
