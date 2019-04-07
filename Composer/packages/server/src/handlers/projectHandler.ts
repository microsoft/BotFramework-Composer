import path from 'path';
import fs from 'fs';

import produce from 'immer';

import { FileStorage } from '../storage/FileStorage';
import StorageHandler from '../handlers/storageHandler';

export default class ProjectHandler {
  // memory cache the project we opened
  private openBot: any = null;
  private storage: FileStorage;
  private setting: FileStorage;
  private openLastActiveBot = false;
  private storageHandler: StorageHandler;
  constructor(stoarge: FileStorage, setting: FileStorage) {
    this.storage = stoarge;
    this.setting = setting;
    this.storageHandler = new StorageHandler(stoarge);
    // get recentAccessBots
    this.openBot = this.checkOpenBotInStorage();
  }

  public updateOpenBot = (body: any) => {
    // deal with parameters
    if (!body.storageId) {
      throw { error: 'please give the storageId where project saved' };
    }
    const currentStorage = this.storageHandler.getStorageById(body.storageId);
    if (!currentStorage) {
      throw { error: 'can not find storage' };
    }
    try {
      if (currentStorage.type === 'LocalDrive') {
        this.openBot = this.updateLocalBot(body);
      } else if (currentStorage.type === 'AzureBlob') {
        this.openBot = this.updateAzureBot(body);
      }
    } catch (error) {
      throw error;
    }
    return this.openBot;
  };

  private updateLocalBot = (body: any) => {
    if (!body.path || (path.extname(body.path) !== '.bot' && path.extname(body.path) !== '.botproj')) {
      throw { error: 'path error. can not accept this type of file, please give .bot or .botproj file' };
    }
    // check if the path is correct
    if (!fs.existsSync(body.path)) {
      throw { error: 'file not found' };
    }
    body.path = path.normalize(body.path);
    // update recent open bot list
    let recentOpenBots: object[] = this.storage.getItem('recentAccessedBots', []);

    // if this openBot in List, update position
    const index = recentOpenBots.findIndex((value: any) => {
      return path.resolve(value.path) === body.path;
    });
    const rootPath = process.cwd();
    body.path = body.path.replace(/\\/g, '/');
    let item;
    if (index >= 0) {
      recentOpenBots = produce(recentOpenBots, draft => {
        draft.splice(index, 1);
        item = Object.assign({}, body);
        item.path = path.relative(rootPath, body.path).replace(/\\/g, '/');
        item.lastAccessTime = Date.now();
        draft.push(item);
        body.lastAccessTime = item.lastAccessTime;
      });
    } else {
      recentOpenBots = produce(recentOpenBots, draft => {
        item = Object.assign({}, body);
        item.path = path.relative(rootPath, body.path).replace(/\\/g, '/');
        item.lastAccessTime = Date.now();
        draft.push(item);
        body.lastAccessTime = item.lastAccessTime;
      });
    }
    this.storage.setItem('recentAccessedBots', recentOpenBots);
    return body;
  };

  private updateAzureBot = (body: any) => {
    // open a bot project in azure blob
    // update recent open bot list
    let recentOpenBots: object[] = this.storage.getItem('recentAccessedBots', []);

    // if this openBot in List, update position
    const index = recentOpenBots.findIndex((value: any) => {
      return value.container === body.container && value.blob === body.blob;
    });
    let item;
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
  private checkOpenBotInStorage = () => {
    const openLastActiveBot = this.openLastActiveBot || this.setting.getItem<boolean>('openLastActiveBot', false);
    const recentOpenBots = this.storage.getItem('recentAccessedBots', []);
    if (openLastActiveBot && recentOpenBots.length > 0) {
      // deal with relative path
      const result = produce(recentOpenBots[recentOpenBots.length - 1], draft => {
        draft.path = path.resolve(draft.path);
        draft.path = draft.path.replace(/\\/g, '/');
      });
      return result;
    } else {
      return null;
    }
  };

  public getOpenBot() {
    return this.openBot;
  }
}
