import path from 'path';

import produce from 'immer';
import { merge, set } from 'lodash';

import { FileStorage } from '../storage/FileStorage';
import StorageHandler from '../handlers/storageHandler';
import { AzureStorage } from '../storage/AzureStorage';
import { LocalStorage } from '../storage/LocalStorage';
import { Constant } from '../constant';
import { IStorageProvider } from '../storage/IStorageProvider';
import { IStorageDefinition } from '../storage/IStorageDefinition';
import DIALOG_TEMPLATE from '../dialogTemplate.json';
import { FileInfo, BotConfig } from '../constant';

export default class ProjectHandler {
  // memory cache the project we opened
  private openBot: any;
  private storage: FileStorage;
  private setting: FileStorage;
  private openLastActiveBot: boolean;
  private storageHandler: StorageHandler;
  private botStorage: IStorageDefinition | any;
  private storageProvider: IStorageProvider | any;
  constructor(storage: FileStorage, setting: FileStorage, openLastActiveBot = false) {
    this.storage = storage;
    this.setting = setting;
    this.storageHandler = new StorageHandler(storage);
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
      const item = this.updateRecentAccessBot({ storageId: body.storageId, path: pathToSave });
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
  private createFromTemplate(steps: string[]) {
    const newDialog = merge({}, DIALOG_TEMPLATE);
    steps.forEach((type: string, idx: number) => {
      set(newDialog, `rules[0].steps[${idx}].$type`, type.trim());
    });
    const text = JSON.stringify(newDialog, null, 2) + '\n';
    return text;
  }

  private getProvider(body: IStorageDefinition): IStorageProvider {
    try {
      const { type, path, account, key } = body;
      switch (type) {
        case Constant.AzureBlob:
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

  public async getBotProject(reqPath: string): Promise<FileInfo[]> {
    try {
      if (!ProjectHandler.isBotProj(reqPath)) {
        throw { error: 'not a bot project file' };
      }
      const fileList: FileInfo[] = [];
      let content = await this.storageProvider.readFile(reqPath);
      const index = reqPath.lastIndexOf('/');
      fileList.push({
        name: reqPath.substring(index + 1),
        content: JSON.parse(content),
        path: reqPath,
        dir: reqPath.substring(0, index),
      });
      // get 'files' from .bot file
      const botConfig: BotConfig = JSON.parse(content);
      if (botConfig !== undefined && Array.isArray(botConfig.files)) {
        for (const pattern of botConfig.files) {
          const paths = await (this.storageProvider as IStorageProvider).listFilesByPattern(
            reqPath.substring(0, index),
            pattern
          );
          // find the index of the entry dialog defined in the botproject
          // save & remove it from the paths array before it is sorted
          let mainPath = '';
          if (this.isDialogExtension(pattern)) {
            const mainPathIndex = paths.findIndex((elem: any) => elem.indexOf(botConfig.entry) !== -1);
            mainPath = paths[mainPathIndex];
            paths.splice(mainPathIndex, 1);
          }

          for (const filePath of paths.sort()) {
            const realFilePath: string = `${reqPath.substring(0, index)}/${filePath}`;
            // skip lg files for now
            if (!realFilePath.endsWith('.lg')) {
              content = await this.storageProvider.readFile(realFilePath);
              fileList.push({
                name: filePath,
                content: JSON.parse(content),
                path: realFilePath,
                dir: reqPath.substring(0, index),
              });
            }
          }

          // resolve the entry dialog path and add it to the front of the
          // now sorted paths array
          if (this.isDialogExtension(pattern)) {
            const mainFilePath = `${reqPath.substring(0, index)}/${mainPath}`;
            if (!mainFilePath.endsWith('.lg')) {
              content = await this.storageProvider.readFile(mainFilePath);
              fileList.unshift({
                name: mainPath,
                content: JSON.parse(content),
                path: mainFilePath,
                dir: reqPath.substring(0, index),
              });
            }
          }
        }
      }
      return fileList;
    } catch (error) {
      throw error;
    }
  }

  public async writeFileToBot(name: string, steps: string[]) {
    try {
      const content = this.createFromTemplate(steps);
      return await this.storageProvider.writeFile(name, content, this.openBot.path);
    } catch (error) {
      throw error;
    }
  }
}
