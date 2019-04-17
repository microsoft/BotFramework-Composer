import azure from 'azure-storage';

import { IFileStorage, Stat, StorageConnection } from './interface';

export class AzureBlobStorage implements IFileStorage {
  private client: azure.BlobService;
  constructor(conn: StorageConnection) {
    if (conn.account && conn.key) {
      this.client = azure.createBlobService(conn.account, conn.key);
    } else {
      throw new Error('miss data');
    }
  }
  async stat(reqPath: string): Promise<Stat> {
    reqPath = decodeURI(reqPath);
    const names = reqPath.split(/[/]|[\\]/).filter(i => i.length);
    let lastModified = '';
    let isFile = false;
    let size = '';
    if (names.length > 1) {
      // try to list blob with prefix, if return value length larger than 1, is dir
      const container = names[0];
      const blobPrefix = names.slice(1).join('/');
      isFile = await new Promise((resolve, reject) => {
        this.client.doesBlobExist(container, blobPrefix, (err, data) => {
          if (err) {
            reject(err);
          } else {
            lastModified = data.lastModified;
            size = data.contentLength;
            resolve(data.exists ? true : false);
          }
        });
      });
    }
    return {
      isDir: !isFile,
      isFile: isFile,
      lastModified: lastModified,
      size: size,
    };
  }

  async readFile(reqPath: string): Promise<string> {
    reqPath = decodeURI(reqPath);
    const names = reqPath.split(/[/]|[\\]/).filter(i => i.length);
    const container = names[0];
    const blobPath = names.slice(1).join('/');
    return new Promise((resolve, reject) => {
      this.client.getBlobToText(container, blobPath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async readDir(reqPath: string): Promise<string[]> {
    reqPath = decodeURI(reqPath);
    const names = reqPath.split(/[/]|[\\]/).filter(i => i.length);
    if (names.length === 0) {
      // show containers
      return new Promise((resolve, reject) => {
        this.client.listContainersSegmented(null as any, (err, data) => {
          if (err) {
            reject(err);
          } else {
            const result: string[] = [] as string[];
            data.entries.forEach(i => {
              result.push(i.name);
            });
            resolve(result);
          }
        });
      });
    } else {
      const container = names[0];
      const blobPath = names.slice(1).join('/');
      return new Promise((resolve, reject) => {
        this.client.listBlobsSegmentedWithPrefix(container, blobPath, null as any, (err, data) => {
          if (err) {
            reject(err);
          } else {
            const result: string[] = [] as string[];
            data.entries.forEach(i => {
              const index = i.name.indexOf(blobPath);
              result.push(i.name.substring(index + blobPath.length));
            });
            resolve(result);
          }
        });
      });
    }
  }

  // check if it's file and can be read
  async exists(reqPath: string): Promise<boolean> {
    reqPath = decodeURI(reqPath);
    const names = reqPath.split(/[/]|[\\]/).filter(i => i.length);
    if (names.length < 2) {
      return false;
    }
    const container = names[0];
    const blobPath = names.slice(1).join('/');
    return new Promise((resolve, reject) => {
      this.client.doesBlobExist(container, blobPath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.exists ? true : false);
        }
      });
    });
  }

  async writeFile(reqPath: string, content: any): Promise<void> {
    reqPath = decodeURI(reqPath);
    const names = reqPath.split(/[/]|[\\]/).filter(i => i.length);
    const blobPath = names.slice(1).join('/');
    return new Promise((resolve, reject) => {
      this.client.createOrReplaceAppendBlob(names[0], blobPath, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
