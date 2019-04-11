import produce from 'immer';
import { FileStorage } from '../storage/FileStorage';
import StorageHandler from '../handlers/storageHandler';
import { AzureStorage } from '../storage/AzureStorage';
import { LocalStorage } from '../storage/LocalStorage';
import { Constant } from '../constant';
import { IStorageProvider } from '../storage/IStorageProvider';
import { IStorageDefinition } from '../storage/IStorageDefinition';

export default class ProjectHandler {
  // memory cache the project we opened
  private openBot: any;
  private storage: FileStorage;
  private setting: FileStorage;
  private openLastActiveBot: boolean;
  private storageHandler: StorageHandler;
  private botStorage: IStorageDefinition | any;
  private storageProvider: IStorageProvider | any;
  constructor(stoarge: FileStorage, setting: FileStorage, openLastActiveBot = false) {
    this.storage = stoarge;
    this.setting = setting;
    this.storageHandler = new StorageHandler(stoarge);
    this.openLastActiveBot = openLastActiveBot;
    // get recentAccessBots
    this.openBot = this.checkOpenBotInStorage();
    if (this.openBot) {
      this.botStorage = this.storageHandler.getStorageById(this.openBot.storageId);
      this.storageProvider = this.getProvider(this.botStorage);
    }
  }
  isDialogExtension = (input: string): boolean => input.indexOf('.dialog') !== -1;
  public updateOpenBot = (body: any) => {
    // deal with parameters
    if (!body.storageId) {
      throw { error: 'please give the storageId where project saved' };
    }
    try {
      const currentStorage = this.storageHandler.getStorageById(body.storageId);
      // change path to relative if local storage
      const pathToSave =
        currentStorage.type === Constant.LocalDrive ? LocalStorage.pathToRelative(body.path) : body.path;
      let item = this.updateRecentAccessBot({ storageId: body.storageId, path: pathToSave });
      if (item && currentStorage.type === Constant.LocalDrive) {
        this.openBot = {
          storageId: item.storageId,
          path: LocalStorage.pathToAbsolute(body.path),
          lastAccessTime: item.lastAccessTime,
        };
      } else {
        this.openBot = { storageId: item.storageId, path: body.path, lastAccessTime: item.lastAccessTime };
      }
      this.botStorage = currentStorage;
      this.storageProvider = this.getProvider(this.botStorage);
    } catch (error) {
      throw error;
    }

    return this.openBot;
  };

  private updateRecentAccessBot = (body: any) => {
    // update recent open bot list
    let recentOpenBots: object[] = this.storage.getItem('recentAccessedBots', []);
    // if this openBot in List, update position
    const index = recentOpenBots.findIndex((value: any) => {
      return value.storageId === body.storageId && value.path === body.path;
    });

    let item: any;
    if (index >= 0) {
      recentOpenBots = produce(recentOpenBots, draft => {
        draft.splice(index, 1);
        item = Object.assign({}, body);
        item.lastAccessTime = Date.now();
        draft.push(item);
      });
    } else {
      recentOpenBots = produce(recentOpenBots, draft => {
        item = Object.assign({}, body);
        item.lastAccessTime = Date.now();
        draft.push(item);
      });
    }
    this.storage.setItem('recentAccessedBots', recentOpenBots);
    return item;
  };

  // private updateAzureBot = (body: any) => {
  //   // open a bot project in azure blob
  //   // update recent open bot list
  //   let recentOpenBots: object[] = this.storage.getItem('recentAccessedBots', []);

  //   // if this openBot in List, update position
  //   const index = recentOpenBots.findIndex((value: any) => {
  //     return value.container === body.container && value.blob === body.blob;
  //   });
  //   let item;
  //   if (index >= 0) {
  //     recentOpenBots = produce(recentOpenBots, draft => {
  //       draft.splice(index, 1);
  //       item = Object.assign({}, body);
  //       item.lastAccessTime = Date.now();
  //       draft.push(item);
  //     });
  //   } else {
  //     recentOpenBots = produce(recentOpenBots, draft => {
  //       item = Object.assign({}, body);
  //       item.lastAccessTime = Date.now();
  //       draft.push(item);
  //     });
  //   }
  //   this.storage.setItem('recentAccessedBots', recentOpenBots);
  //   return item;
  // };
  private checkOpenBotInStorage = () => {
    const openLastActiveBot = this.openLastActiveBot || this.setting.getItem<boolean>('openLastActiveBot', false);
    const recentOpenBots = this.storage.getItem('recentAccessedBots', []);
    if (openLastActiveBot && recentOpenBots.length > 0) {
      // deal with relative path
      const result = produce(recentOpenBots[recentOpenBots.length - 1], draft => {
        if (draft.type === Constant.LocalDrive) {
          draft.path = LocalStorage.pathToAbsolute(draft.path);
        }
      });
      return result;
    } else {
      return null;
    }
  };

  public getOpenBot() {
    return this.openBot;
  }
  public static isBotProj(reqPath: string): boolean {
    if (!reqPath || (path.extname(reqPath) !== '.bot' && path.extname(reqPath) !== '.botproj')) {
      return false;
    }
    return true;
  }
  private createFromTemplate() {
    const temp = new URL(reqPath);
    if (temp.hostname !== this.rootPath.hostname) {
      throw new Error('path error');
    }
    const index = temp.pathname.indexOf('/');

    const newDialog = merge({}, DIALOG_TEMPLATE);

    steps.forEach((type: string, idx: number) => {
      set(newDialog, `rules[0].steps[${idx}].$type`, type.trim());
    });
    const text = JSON.stringify(newDialog, null, 2) + '\n';
  }
  private getProvider(body: IStorageDefinition): IStorageProvider {
    try {
      const { type, path } = body;
      switch (type) {
        case Constant.AzureBlob:
          const { account, key } = body;
          return new AzureStorage(account, key, path);
        case Constant.LocalDrive:
          return new LocalStorage(path);
        default:
          throw { error: 'not support this type of storage' };
      }
    } catch (error) {
      // body lack of id or type
      throw error;
    }
  }

  public async getFiles() {
    try {
      return await this.storageProvider.getBotProject(this.openBot.path);
    } catch (error) {
      throw error;
    }
  }

  public async addFileToBot(name: string, steps: string[]) {
    try {
      return await this.storageProvider.createFile(name, steps, this.openBot.path);
    } catch (error) {
      throw error;
    }
  }

  public async updateFileInBot(name: string, steps: string[]) {
    try {
      return await this.storageProvider.updateFile(name, steps, this.openBot.path);
    } catch (error) {
      throw error;
    }
  }
}
