import { Constant } from '../constant';
import { IStorageDefinition } from '../storage/IStorageDefinition';
import produce from 'immer';

import { FileStorage } from '../storage/FileStorage';

import { IStorageProvider } from 'src/storage/IStorageProvider';
import { AzureStorage } from '../storage/AzureStorage';
import { LocalStorage } from '../storage/LocalStorage';

export default class StorageHandler {
  private _storage: FileStorage; // link to storage.json file
  constructor(storage: FileStorage) {
    this._storage = storage;
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
  public getStorage(): IStorageDefinition[] {
    try {
      const storagesList = produce<IStorageDefinition[]>(this._storage.getItem(Constant.linkedStorages, []), draft => {
        for (const item of draft) {
          if (item.type === Constant.LocalDrive) {
            // deal with relative path
            item.path = LocalStorage.pathToAbsolute(item.path);
          }
        }
      });
      return storagesList;
    } catch (error) {
      throw error;
    }
  }

  public getStorageById(id: string): IStorageDefinition {
    try {
      const storagesList: IStorageDefinition[] = this._storage.getItem(Constant.linkedStorages, []);

      const index = storagesList.findIndex((value: any) => {
        return value.id === id;
      });
      if (index < 0) {
        throw new Error('storage not found');
      }
      if (index > -1 && storagesList[index].type === Constant.LocalDrive) {
        return produce(storagesList[index], draft => {
          draft.path = LocalStorage.pathToAbsolute(draft.path);
        });
      }
      return storagesList[index];
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
      let storageProvider = this.getProvider(current);
      result = await storageProvider.listFiles(reqPath);
    } catch (error) {
      throw error;
    }
    return result;
  }

  // add Or Update Storage
  public async addStorage(body: IStorageDefinition) {
    // save body in linkedStorages
    try {
      this.isDefinitionValidate(body);
      const result = produce<IStorageDefinition[]>(this._storage.getItem(Constant.linkedStorages, []), draft => {
        const index = draft.findIndex((value: IStorageDefinition) => {
          return value.id === body.id;
        });
        if (index >= 0) {
          draft.splice(index, 1);
        }
        if (body.type === Constant.LocalDrive) {
          // deal with relative path
          body.path = LocalStorage.pathToRelative(body.path);
        }
        draft.push(body);
      });
      this._storage.setItem(Constant.linkedStorages, result);
    } catch (error) {
      throw error;
    }
  }

  public async deleteStorage(body: any) {
    if (!body.id) {
      throw { error: 'lack of id' };
    }
    try {
      const result = produce<IStorageDefinition[]>(this._storage.getItem(Constant.linkedStorages, []), draft => {
        const index = draft.findIndex((value: IStorageDefinition) => {
          return value.id === body.id;
        });
        if (index >= 0) {
          draft.splice(index, 1);
        } else {
          throw { error: 'storage not exist' };
        }
      });
      this._storage.setItem(Constant.linkedStorages, result);
    } catch (error) {
      throw error;
    }
  }

  private isDefinitionValidate(body: IStorageDefinition) {
    // check
    switch (body.type) {
      // check whether account and key is complete
      case Constant.AzureBlob:
        if (!body.account || !body.key || !body.path) {
          throw { error: 'lack account or key' };
        }
        break;
      case Constant.LocalDrive:
        if (!body.path) {
          throw { error: 'lack path' };
        }
        break;
      default:
        throw { error: 'not support this type of storage' };
    }
  }
}
