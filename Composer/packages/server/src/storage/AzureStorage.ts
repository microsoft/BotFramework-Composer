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

  // means delete a blob
  async deleteFile(reqPath: string): Promise<any> {
    if (!this.isValidate(reqPath)) {
      const temp = new URL(reqPath);
      const tempPath = decodeURIComponent(temp.pathname);
      // only include not ''
      const items = tempPath.split('/').filter(i => i.length);
      if (items.length > 1) {
        return new Promise((resolve, reject) => {
          this._blobService.deleteBlob(items[0], items[1], (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      }
    }
  }
  // means delete a container
  async rmdir(reqPath: string): Promise<any> {
    if (!this.isValidate(reqPath)) {
      const temp = new URL(reqPath);
      const tempPath = decodeURIComponent(temp.pathname);
      // only include not ''
      const items = tempPath.split('/').filter(i => i.length);
      if (items.length > 0) {
        return new Promise((resolve, reject) => {
          this._blobService.deleteContainer(items[0], (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      }
    }
  }

  isValidate(reqPath: string): boolean {
    // check if the path under the rootpath, if no, it's not validate
    if (!urlExp.test(reqPath)) return false; // not url
    const temp = new URL(reqPath);
    if (temp.host !== this.rootPath) return false;
    return temp.pathname !== '/'; // if child path, return true
  }

  public async listFiles(reqPath: string) {
    if (!this.isValidate(reqPath)) {
      throw { error: 'path is not valid' };
    }
    try {
      let result: any;
      const temp = new URL(reqPath).pathname;
      const items = decodeURIComponent(temp)
        .split('/')
        .filter(i => i.length);

      if (items.length === 0) {
        result = await this.listContainers();
      } else if (items.length === 1) {
        result = await this.listBlobDirInContainer(items[0]);
      } else if (items.length > 1) {
        const blobPrefix = items.splice(1).join('/');
        result = await this.listBlobsInDir(items[0], blobPrefix);
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
    const temp = new URL(reqPath).pathname;
    const items = decodeURIComponent(temp)
      .split('/')
      .filter(i => i.length);
    if (items.length < 1) {
      throw new Error('no container');
    }
    return new Promise((resolve, reject) => {
      this._blobService.createBlockBlobFromText(items[0], `${items.join('/')}/${name}`, content, err => {
        if (err) {
          reject(err);
        } else {
          resolve({ message: `OK` });
        }
      });
    });
  }
  async listFilesByPattern(reqPath: string, pattern: string) {
    if (!this.isValidate(reqPath)) {
      throw { error: 'path is not valid' };
    }
    try {
      let result: any;
      const temp = new URL(reqPath).pathname;
      const items = decodeURIComponent(temp)
        .split('/')
        .filter(i => i.length);
      const blobPrefix = items.splice(1).join('/');
      result = await this.listBlobsInDir(items[0], blobPrefix);
      let reg = new RegExp(pattern);
      let filesPath: string[] = [];
      (result as BlobService.BlobResult[]).filter(blobfile => {
        let index = blobfile.name.lastIndexOf('/');
        let filename = blobfile.name.substring(index + 1);
        if (reg.test(filename)) {
          filesPath.push(blobfile.name);
        }
        return;
      });
      return filesPath;
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

  // private async listBlobsInContainer(containerName: string): Promise<BlobService.BlobResult[] | Error> {
  //   return new Promise((resolve, reject) => {
  //     this._blobService.listBlobsSegmented(containerName, null as any, (err, data) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         console.log({ message: `${data.entries.length} blobs in '${containerName}'`, blobs: data.entries });
  //         resolve(data.entries);
  //       }
  //     });
  //   });
  // }

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
