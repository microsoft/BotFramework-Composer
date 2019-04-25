import azure from 'azure-storage';
import minimatch from 'minimatch';

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
      return await this.getContainersByPath(path);
    } else {
      const container = names[0];
      const blobPath = names.slice(1).join('/');
      return new Promise((resolve, reject) => {
        // get files in this prefix.
        console.log(blobPath);
        this.client.listBlobsSegmentedWithPrefix(
          container,
          names.length > 1 ? `${blobPath}/` : '',
          null as any,
          (err, data) => {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              const result: Set<string> = new Set();
              data.entries.forEach(i => {
                const temp = i.name.replace(blobPath, '');
                result.add(temp.split('/').filter(i => i.length)[0]);
              });
              resolve(Array.from(result));
            }
          }
        );
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
    if (names.length <= 1) {
      throw new Error('path must include container name and blob name');
    }
    const blobPath = names.slice(1).join('/');

    return new Promise((resolve, reject) => {
      this.client.createBlockBlobFromText(names[0], blobPath, content, err => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async mkDir(path: string): Promise<void> {
    const names = path.split('/').filter(i => i.length);
    if (names.length < 1) {
      throw new Error('path must include container name and blob name');
    }
    return new Promise((resolve, reject) => {
      // if container not exist, create container, then create blob file
      this.client.createContainerIfNotExists(names[0], err => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async glob(pattern: string, path: string): Promise<string[]> {
    // all the path transform should be remove next time and ensure path was posix pattern
    const names = path.split('/').filter(i => i.length);
    const prefix = names.slice(1).join('/');
    const containers = await this.getContainersByPath(path);
    // get all blob under path
    return await new Promise((resolve, reject) => {
      for (let index = 0; index < containers.length; index++) {
        const element = containers[index];
        this.client.listBlobsSegmentedWithPrefix(
          element,
          names.length > 1 ? `${prefix}/` : '',
          null as any,
          (err, data) => {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              // filter all file names
              const result = [] as string[];
              for (let i = 0; i < data.entries.length; i++) {
                let temp = `/${element}/${data.entries[i].name}`;
                temp = temp.replace(`${path}/`, '');
                if (minimatch(temp, pattern)) {
                  console.log(temp);
                  result.push(temp);
                }
              }
              resolve(result);
            }
          }
        );
      }
    });
  }

  async getContainersByPath(path: string): Promise<string[]> {
    const names = path.split('/').filter(i => i.length);
    const containers = [] as string[];
    // get all containers under path
    if (names.length < 1) {
      await new Promise((resolve, reject) => {
        this.client.listContainersSegmented(null as any, (err, data) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            data.entries.forEach(item => {
              containers.push(item.name);
            });
            resolve(containers);
          }
        });
      });
    } else {
      containers.push(names[0]);
    }
    return containers;
  }
}
