import azure, { BlobService } from 'azure-storage';
import { IStorageProvider } from './IStorageProvider';
import { URL } from 'url';
import path from 'path';

const urlExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/);

export class AzureStorage implements IStorageProvider {
  public _blobService: BlobService;
  private account: string;
  private key: string;
  private rootPath: string; // base url only include hostname
  constructor(account: string, key: string, url: string) {
    if (!urlExp.test(url)) {
      throw new Error('url invalid');
    }
    this.account = account;
    this.key = key;
    this._blobService = azure.createBlobService(this.account, this.key);
    this.rootPath = new URL(url).host; //encode string
  }

  async deleteFile(reqPath: string): Promise<any> {
    if (!this.isValidate(reqPath)) {
      throw new Error('path invalid');
    }
  }
  async rmdir(reqPath: string): Promise<any> {
    if (!this.isValidate(reqPath)) {
      throw new Error('path invalid');
    }
  }
  isValidate(reqPath: string): boolean {
    // check if the path under the rootpath, if no, it's not validate
    if (reqPath === this.rootPath) return false; // not child
    if (!urlExp.test(reqPath)) return false; // not url
    const parentTokens = this.rootPath.split('/').filter(i => i.length);
    return parentTokens.every((t, i) => reqPath.split('/')[i] === t);
  }
  public async listFiles(reqPath: string) {
    if (!this.isValidate(reqPath)) {
      throw { error: 'path is not valid' };
    }
    try {
      let result: any;
      const url = new URL(reqPath);

      if (url.pathname === '/') {
        result = await this.listContainers();
      } else if (url.pathname !== '/') {
        let pathList = url.pathname.substring(1).split('/');
        if (pathList.length >= 2 && pathList[1] !== '') {
          result = await this.listBlobsInDir(pathList[0], pathList[1]);
        } else if (pathList[0] !== '') {
          // 有folder
          result = await this.listBlobDirInContainer(pathList[0]);
        } else {
          // 没有foldere
          result = await this.listBlobsInContainer(pathList[0]);
        }
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
  async readFile(reqPath: string): Promise<any> {
    reqPath = encodeURI(reqPath);
    const temp = new URL(reqPath);
    temp.pathname = decodeURI(temp.pathname);
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

  async writeFile(name: string, content: any, reqPath: string): Promise<any> {
    // update or create
    if (!this.isValidate(reqPath)) {
      throw new Error('path invalid');
    }
    return new Promise((resolve, reject) => {
      this._blobService.createBlockBlobFromText(
        temp.pathname.substring(1, index),
        `${temp.pathname.substring(index)}/${name}`,
        content,
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

  async getBotProject(reqPath: string) {
    if (!AzureStorage.isBotProj(reqPath)) {
      throw { error: 'not a bot project file' };
    }
    try {
      let fileList = [] as Object[];
      let content = await this.getFileByPath(reqPath);
      const index = reqPath.lastIndexOf('/');
      let botPath = new URL(reqPath).pathname;
      botPath = decodeURI(botPath);
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
  private async listBlobsInDir(container: string, dir: string): Promise<BlobService.BlobResult[] | Error> {
    return new Promise((resolve, reject) => {
      this._blobService.listBlobsSegmentedWithPrefix(container, dir, null as any, (err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log({ message: `${data.entries.length} blobs in '${container}'`, blobs: data.entries });
          resolve(data.entries);
        }
      });
    });
  }

  private async listBlobsInContainer(containerName: string): Promise<BlobService.BlobResult[] | Error> {
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

  private async listBlobDirInContainer(containerName: string): Promise<BlobService.BlobDirectoryResult[] | Error> {
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
