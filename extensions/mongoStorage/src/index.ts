// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as pathLib from 'path';

import * as mongoose from 'mongoose';
import * as globToRegExp from 'glob-to-regexp';

import { StorageConnection, IFileStorage, MakeDirectoryOptions, UserIdentity } from './interface';

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  path: {
    type: String,
  },
  folder: {
    type: String,
  },
  isFolder: {
    type: Boolean,
    default: false,
  },
  content: {
    type: String,
  },
  lastModified: {
    type: Date,
  },
  modifiedBy: {
    type: String,
  },
});

const cleanPath = (path: string): string => {
  // if somehow there is a // in the path
  return path.replace(/\/\//g, '/').replace(/\\\\/g, '\\');
};

class MongoStorage implements IFileStorage {
  static db: any;
  static files: any;
  private _user: UserIdentity;

  constructor(conn: StorageConnection, user?: UserIdentity) {
    // connect to Mongo
    // TODO: make the connect string and options pull from the connection
    conn;

    if (!MongoStorage.db) {
      mongoose.connect('mongodb://localhost:27017/composer', {});
      MongoStorage.db = mongoose.connection;
      MongoStorage.db.on('error', err => {
        throw new Error(err);
      });
      MongoStorage.db.once('open', function() {
        // we're connected!
        // eslint-disable-next-line no-console
        // console.log('CONNECTED TO MONGO');
      });

      MongoStorage.files = mongoose.model('file', fileSchema, 'files');

    }

    if (user) {
      this._user = user;
    }

  }

  async stat(path: string): Promise<any> {
    path = cleanPath(path);
    return new Promise((resolve, reject) => {
      MongoStorage.files.findOne({ path: path }, (err, file) => {
        if (err) {
          reject(err);
        } else if (file) {
          if (file.isFolder === true) {
            resolve({
              isDir: true,
              isFile: false,
              lastModified: file.lastModified,
              isWritable: true,
              size: 1, // TODO: real size
            });
          } else {
            resolve({
              isDir: false,
              isFile: true,
              lastModified: file.lastModified,
              isWritable: true,
              size: 1, // TODO: real size
            });
          }
        } else if (!file) {
          // perhaps this is a folder
          MongoStorage.files.findOne({ folder: path }, (err, file) => {
            if (err) {
              reject(err);
            } else if (!file) {
              if (path == '/') {
                resolve({
                  isDir: true,
                  isFile: false,
                  lastModified: new Date(),
                  isWritable: true,
                  size: 0, // TODO: ??
                });
              } else {
                reject(`path ${path} not found`);
              }
            } else {
              resolve({
                isDir: true,
                isFile: false,
                lastModified: file.lastModified,
                isWritable: true,
                size: 0, // TODO: ??
              });
            }
          });
        }
      });
    });
  }

  async readFile(path: string): Promise<string> {
    path = cleanPath(path);

    return new Promise((resolve, reject) => {
      MongoStorage.files.findOne({ path: path }, (err, file) => {
        if (err) {
          reject(err);
        } else if (!file) {
          reject('File not found');
        } else {
          resolve(file.content.replace(/^\uFEFF/, ''));
        }
      });
    });
  }

  async readDir(path: string): Promise<string[]> {
    path = cleanPath(path);

    return new Promise((resolve, reject) => {
      // find all files where the parent folder matches the specified path
      MongoStorage.files.find({ folder: path }, 'path', {}, (err, files) => {
        if (err) {
          reject(err);
        } else if (!files) {
          reject('Folder not found');
        } else {
          // strip off the path, leaving just the filename
          resolve(
            files.map(item => {
              return item.path.replace(path, '');
            })
          );
        }
      });
    });
  }

  async exists(path: string): Promise<boolean> {
    path = cleanPath(path);

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await this.stat(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  async writeFile(path: string, content: any): Promise<void> {
    path = cleanPath(path);

    return new Promise((resolve, reject) => {
      const doc = {
        path: path,
        content: content,
        lastModified: new Date(),
        modifiedBy: this._user ? this._user.id : null,
        folder: pathLib.dirname(path),
      };

      MongoStorage.files.findOneAndUpdate({ path: path }, doc, { upsert: true }, (err, updated) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async removeFile(path: string): Promise<void> {
    path = cleanPath(path);

    return new Promise((resolve, reject) => {
      MongoStorage.files.deleteOne({ path: path }, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async mkDir(path: string, options?: MakeDirectoryOptions): Promise<void> {
    path = cleanPath(path);

    return new Promise((resolve, reject) => {
      const doc = {
        path: path,
        isFolder: true,
        lastModified: new Date(),
        folder: pathLib.dirname(path),
      };

      MongoStorage.files.findOneAndUpdate({ path: path }, doc, { upsert: true }, (err, updated) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async rmDir(path: string): Promise<void> {
    path = cleanPath(path);

    return new Promise((resolve, reject) => {
      // const root = pathLib.dirname(path);
      const pattern = new RegExp(path + '.*');

      // remove all files inside this folder, any subfolder, including the folder itself
      MongoStorage.files.remove({ folder: pattern }, (err, removed) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  //To do
  async rmrfDir(path: string): Promise<void> {}

  async glob(pattern: string, path: string): Promise<string[]> {
    path = cleanPath(path);

    return new Promise((resolve, reject) => {
      //convert the glob to a regexp
      const regex = globToRegExp(pattern, { globstar: true });

      // make sure the folder contains the root path but can also have other stuff
      const pathPattern = new RegExp(path + '.*');
      MongoStorage.files.find({ path: regex, folder: pathPattern }, (err, files) => {
        if (err) {
          reject(err);
        } else {
          // strip off the path, leaving just the filename
          resolve(
            files.map(item => {
              return item.path.replace(path, '');
            })
          );
        }
      });
    });
  }

  async copyFile(src: string, dest: string): Promise<void> {
    src = cleanPath(src);
    dest = cleanPath(dest);

    const content = await this.readFile(src);
    return this.writeFile(dest, content);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    oldPath = cleanPath(oldPath);
    newPath = cleanPath(newPath);

    return new Promise((resolve, reject) => {
      const update = {
        path: newPath,
        lastModified: new Date(),
        folder: pathLib.dirname(newPath),
      };

      MongoStorage.files.findOneAndUpdate({ path: oldPath }, update, {}, (err, updated) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default async (composer: any): Promise<void> => {
  // pass in the custom storage class that will override the default
  await composer.useStorage(MongoStorage);
}