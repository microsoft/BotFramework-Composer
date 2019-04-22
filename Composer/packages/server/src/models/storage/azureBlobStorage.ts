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
  async stat(path: string): Promise<Stat> {
    const names = path.split('/').filter(i => i.length);
    let lastModified = '';
    let isFile = false;
    let size = '';
    if (names.length > 1) {
      // blob equal to file, if blob exist, path is file path
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
      if (!isFile) {
        // if not a file, try to find dir with this prefix, if path is wrong, throw error.
        await new Promise((resolve, reject) => {
          this.client.listBlobDirectoriesSegmentedWithPrefix(container, blobPrefix, null as any, (err, data) => {
            if (err) {
              reject(err);
            } else {
              if (data.entries.length <= 0) reject(new Error('path is not exists'));
              lastModified = '';
              size = '';
              resolve(true);
            }
          });
        });
      }
    }
    return {
      isDir: !isFile,
      isFile: isFile,
      lastModified: lastModified,
      size: size,
    };
  }

  async readFile(path: string): Promise<string> {
    const names = path.split('/').filter(i => i.length);
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

  async readDir(path: string): Promise<string[]> {
    const names = path.split('/').filter(i => i.length);
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
        // get files in this prefix.
        console.log(blobPath);
        this.client.listBlobsSegmentedWithPrefix(container, blobPath, null as any, (err, data) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            const result: Set<string> = new Set();
            data.entries.forEach(i => {
              const index = i.name.indexOf(blobPath);
              const temp = i.name.substring(index + blobPath.length);
              result.add(temp.split('/').filter(i => i.length)[0]);
            });
            resolve(Array.from(result));
          }
        });
      });
    }
  }

  // check if it's file and can be read
  async exists(path: string): Promise<boolean> {
    const names = path.split('/').filter(i => i.length);
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

  async writeFile(path: string, content: any): Promise<void> {
    const names = path.split('/').filter(i => i.length);
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
