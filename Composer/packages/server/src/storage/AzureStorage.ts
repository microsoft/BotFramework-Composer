import azure, { BlobService } from 'azure-storage';
import { IStorageProvider } from './IStorageProvider';
import { URL } from 'url';
import path from 'path';
import glob from 'globby';
import { merge, set } from 'lodash';
import DIALOG_TEMPLATE from '../dialogTemplate.json';
import { BotConfig } from '../constant';

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
    this.rootPath.hostname.split('.')[0];
  }
  isDialogExtension = (input: string): boolean => input.indexOf('.dialog') !== -1;
  // reqPath is url, like https://.../blob/files
  async updateFile(name: string, content: any, reqPath: string) {}
  async getBotProject(reqPath: string) {
    if (!AzureStorage.isBotProj(reqPath)) {
      throw { error: 'not a bot project file' };
    }
    try {
      let fileList = [] as Object[];
      let content = await this.getFileByPath(reqPath);
      const index = reqPath.lastIndexOf('/');
      let botPath = new URL(reqPath).pathname;
      fileList.push({
        name: reqPath.substring(index + 1),
        content: JSON.parse(content),
        path: reqPath,
        dir: botPath,
      });
      // get 'files' from .bot file
      const botConfig: BotConfig = JSON.parse(content);
      if (botConfig !== undefined && Array.isArray(botConfig.files)) {
        for (const pattern of botConfig.files) {
          const paths = await glob(pattern, { cwd: botPath });
          // find the index of the entry dialog defined in the botproject
          // save & remove it from the paths array before it is sorted
          let mainPath = '';
          if (this.isDialogExtension(pattern)) {
            const mainPathIndex = paths.findIndex(elem => elem.indexOf(botConfig.entry) !== -1);
            mainPath = paths[mainPathIndex];
            paths.splice(mainPathIndex, 1);
          }

          for (const filePath of paths.sort()) {
            const realFilePath: string = path.resolve(reqPath, filePath);
            // skip lg files for now
            if (!realFilePath.endsWith('.lg')) {
              content = await this.getFileByPath(realFilePath);
              fileList.push({
                name: filePath,
                content: JSON.parse(content),
                path: realFilePath,
                dir: reqPath,
                relativePath: path.relative(reqPath, realFilePath),
              });
            }
          }

          // resolve the entry dialog path and add it to the front of the
          // now sorted paths array
          if (this.isDialogExtension(pattern)) {
            const mainFilePath = path.resolve(reqPath, mainPath);
            if (!mainFilePath.endsWith('.lg')) {
              content = await this.getFileByPath(mainFilePath);
              fileList.unshift({
                name: mainPath,
                content: JSON.parse(content),
                path: mainFilePath,
                dir: reqPath,
                relativePath: path.relative(reqPath, mainFilePath),
              });
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async getFileByPath(reqPath: string): Promise<string> {
    const temp = new URL(reqPath);
    const index = temp.pathname.substring(1).indexOf('/');
    const container = temp.pathname.substring(1, index + 1);
    // const prefix = temp.pathname.indexOf('/', index + 1);
    const folder = temp.pathname.substring(index + 2);
    return new Promise((resolve, reject) => {
      this._blobService.getBlobToText(container, folder, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
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
