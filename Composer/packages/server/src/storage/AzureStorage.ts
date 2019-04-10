import azure, { BlobService } from 'azure-storage';
import { IStorageProvider } from './IStorageProvider';
import { URL } from 'url';
import path from 'path';

import { merge, set } from 'lodash';
import DIALOG_TEMPLATE from '../dialogTemplate.json';

const urlExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/);

export class AzureStorage implements IStorageProvider {
  public _blobService: BlobService;
  private account: string;
  private key: string;
  private rootPath: URL;
  constructor(account: string, key: string, url: string) {
    this.account = account;
    this.key = key;
    this._blobService = azure.createBlobService(this.account, this.key);
    this.rootPath = new URL(url);
  }

  // reqPath is url, like https://.../container/blob/files
  async updateFile(name: string, content: any, reqPath: string) {}
  async getBotProject(reqPath: string) {
    const temp = new URL(reqPath);
    const index = temp.pathname.indexOf('/');
    const container = temp.pathname.substring(1, index);
    const prefix = temp.pathname.indexOf('/', index + 1);
    const blobs = temp.pathname.substring(prefix);
    return await this.listBlobsWithPrefix(container, blobs);
  }
  async createFile(name: string, steps: string[], reqPath: string) {
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
    return new Promise((resolve, reject) => {
      this._blobService.createBlockBlobFromText(
        temp.pathname.substring(1, index),
        `${temp.pathname.substring(index)}/${name}`,
        text,
        err => {
          if (err) {
            reject(err);
          } else {
            resolve({ message: `OK` });
          }
        }
      );
    });
  }
  deleteFile() {
    throw new Error('Method not implemented.');
  }
  isValidate(): boolean {
    throw new Error('Method not implemented.');
  }
  isPathValidate(reqPath: string): boolean {
    const temp = new URL(reqPath);
    if (temp.hostname !== this.rootPath.hostname) {
      return false;
    }
    return true;
  }
  public isFileExist(): boolean {
    return false;
  }
  public static isBotProj(reqPath: string): boolean {
    let url = new URL(reqPath);
    if (!url || (path.extname(url.pathname) !== '.bot' && path.extname(url.pathname) !== '.botproj')) {
      return false;
    }
    return true;
  }

  public async getFilesAndFoldersByPath(reqPath: string) {
    if (!urlExp.test(reqPath)) {
      throw { error: 'path is not url' };
    }
    if (!this.isPathValidate(reqPath)) {
      throw { error: 'path is not valid' };
    }
    try {
      let result: any;
      const url = new URL(reqPath);

      if (url.pathname === '/') {
        result = await this.listContainers();
      } else if (url.pathname !== '/') {
        let pathList = url.pathname.substring(1).split('/');
        if (pathList.length > 1) {
          result = await this.listBlobsWithPrefix(pathList[0]);
        } else {
          result = await this.listBlobs(pathList[0]);
        }
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
  private async listContainers(): Promise<BlobService.ContainerResult[] | Error> {
    return new Promise((resolve, reject) => {
      this._blobService.listContainersSegmented(null as any, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.entries);
        }
      });
    });
  }

  private async listBlobsWithPrefix(containerName: string): Promise<BlobService.BlobResult[] | Error> {
    return new Promise((resolve, reject) => {
      this._blobService.listBlobsSegmented(containerName, null as any, (err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log({ message: `${data.entries.length} blobs in '${containerName}'`, blobs: data.entries });
          resolve(data.entries);
        }
      });
    });
  }

  private async listBlobs(containerName: string): Promise<BlobService.BlobDirectoryResult[] | Error> {
    return new Promise((resolve, reject) => {
      this._blobService.listBlobDirectoriesSegmented(containerName, null as any, (err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log({ message: `${data.entries.length} blobs in '${containerName}'`, blobs: data.entries });
          resolve(data.entries);
        }
      });
    });
  }
}
