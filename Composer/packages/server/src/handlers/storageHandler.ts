import path from 'path';
import fs from 'fs';
import { URL } from 'url';
import { promisify } from 'util';

import produce from 'immer';

import { FileStorage } from '../storage/FileStorage';
import { AzureStorage } from '../storage/AzureStorage';

const fsStat = promisify(fs.stat);
const urlExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/);

export interface IStorageItem {
  type: string;
  id: string;
  [key: string]: any;
}

export default class StorageHandler {
  private _storage: FileStorage;
  constructor(storage: FileStorage) {
    this._storage = storage;
  }
  public getStorage(): IStorageItem[] {
    try {
      const storagesList = produce<IStorageItem[]>(this._storage.getItem('linkedStorages', []), draft => {
        for (const item of draft) {
          if (item.type === 'LocalDrive') {
            // deal with relative path
            item.path = path.resolve(item.path);
            item.path = path.normalize(item.path);
            item.path = item.path.replace(/\\/g, '/');
          }
        }
      });
      return storagesList;
    } catch (error) {
      throw error;
    }
  }

  public getStorageById(id: string): IStorageItem | null {
    try {
      const storagesList: IStorageItem[] = this._storage.getItem('linkedStorages', []);

      const index = storagesList.findIndex((value: any) => {
        return value.id === id;
      });
      if (index > -1 && storagesList[index].type === 'LocalDrive') {
        return produce(storagesList[index], draft => {
          draft.path = path.resolve(draft.path);
          draft.path = path.normalize(draft.path);
          draft.path = draft.path.replace(/\\/g, '/');
        });
      } else {
        return index > -1 ? storagesList[index] : null;
      }
    } catch (error) {
      throw error;
    }
  }

  // get files and folders from local drive
  public getFolderTree(folderPath: string) {
    const folderTree = [] as object[];
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
      try {
        const itemPath = path.join(folderPath, item);
        const tempStat = fs.statSync(itemPath);
        if (tempStat.isDirectory()) {
          folderTree.push({
            name: item,
            type: 'folder',
            path: itemPath.replace(/\\/g, '/'),
            lastModified: tempStat.mtimeMs,
          });
        } else if (tempStat.isFile()) {
          folderTree.push({
            name: item,
            size: tempStat.size,
            type: 'file',
            lastModified: tempStat.mtimeMs,
            path: itemPath.replace(/\\/g, '/'),
          });
        }
      } catch (error) {
        // log error, and continute getting the path which can access
        console.log(error);
        continue;
      }
    }
    return folderTree;
  }

  public async getContainersOrBlobs(reqPath: string, account: string, key: string) {
    if (!urlExp.test(reqPath)) {
      throw { error: 'path is not url' };
    }
    try {
      let result: any;
      const azure = new AzureStorage(account, key);
      const url = new URL(reqPath);
      if (url.pathname === '/') {
        result = await azure.listContainers();
      } else if (url.pathname !== '/') {
        result = await azure.listBlobs(url.pathname.substring(1));
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async getFilesAndFolders(params: any) {
    let reqPath: string = params.path;
    const storageId: string = params.storageId;
    if (!reqPath) {
      throw { error: 'no path' };
    }
    let result: any;
    try {
      const current = this.getStorageById(storageId);
      if (!current) {
        throw { error: 'storage not found' };
      }
      if (current.type === 'LocalDrive') {
        if (!path.isAbsolute(reqPath)) {
          throw { error: 'path is not absolute path' };
        }

        const stat = await fsStat(reqPath);
        reqPath = path.normalize(reqPath);
        if (stat.isFile()) {
          result = fs.readFileSync(reqPath, 'utf-8');
          result = JSON.parse(result);
        } else if (stat.isDirectory()) {
          const folderTree = this.getFolderTree(reqPath);
          result = {
            name: path.basename(reqPath),
            parent: path.dirname(reqPath).replace(/\\/g, '/'),
            children: folderTree,
          };
        }
      } else if (current.type === 'AzureBlob') {
        result = await this.getContainersOrBlobs(reqPath, current.account, current.key);
      }
    } catch (error) {
      throw error;
    }
    return result;
  }

  // add Or Update Storage
  public async addStorage(body: IStorageItem) {
    // check
    switch (body.type) {
      // check whether account and key is complete
      case 'AzureBlob':
        if (!body.account || !body.key) {
          throw { error: 'lack account or key' };
        }
        break;
      case 'LocalDrive':
        if (!body.path) {
          throw { error: 'lack path' };
        }
        break;
    }
    // save body in linkedStorages
    try {
      const result = produce<IStorageItem[]>(this._storage.getItem('linkedStorages', []), draft => {
        const index = draft.findIndex((value: IStorageItem) => {
          return value.id === body.id;
        });
        if (index >= 0) {
          draft.splice(index, 1);
        }
        if (body.type === 'LocalDrive') {
          // deal with relative path
          const rootPath = process.cwd();
          body.path = path.relative(rootPath, body.path);
          body.path = body.path.replace(/\\/g, '/');
        }
        draft.push(body);
      });
      this._storage.setItem('linkedStorages', result);
    } catch (error) {
      throw error;
    }
  }

  public async deleteStorage(body: any) {
    if (!body.id) {
      throw { error: 'lack of id' };
    }
    try {
      const result = produce<IStorageItem[]>(this._storage.getItem('linkedStorages', []), draft => {
        const index = draft.findIndex((value: IStorageItem) => {
          return value.id === body.id;
        });
        if (index >= 0) {
          draft.splice(index, 1);
        } else {
          throw { error: 'storage not exist' };
        }
      });
      this._storage.setItem('linkedStorages', result);
    } catch (error) {
      throw error;
    }
  }
}
