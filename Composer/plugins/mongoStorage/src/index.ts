/* eslint-disable no-console */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as mongoose from 'mongoose';
import * as pathLib from 'path';
import * as globToRegExp from 'glob-to-regexp';

import { StorageConnection, IFileStorage, MakeDirectoryOptions } from './interface';

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
});

// const folderSchema = new mongoose.Schema({
//   name: {
//     type: String,
//   },
//   path: {
//     type: String,
//   },
// });

export class MongoStorage implements IFileStorage {
  private db: any;
  private files: any;
  // private folders: any;

  constructor(conn: StorageConnection) {
    // connect to Mongo
    // TODO: make the connect string and options pull from the connection
    conn;

    mongoose.connect('mongodb://localhost:27017/composer', {});
    this.db = mongoose.connection;
    // eslint-disable-next-line no-console
    this.db.on('error', console.error.bind(console, 'connection error:'));
    this.db.once('open', function() {
      // we're connected!
      // eslint-disable-next-line no-console
      console.log('CONNECTED TO MONGO');
    });

    this.files = mongoose.model('file', fileSchema, 'files');
    // this.folders = mongoose.model('folder', folderSchema, 'folders');
  }

  async stat(path: string): Promise<any> {
    console.log('MONGO STAT', path);
    return new Promise((resolve, reject) => {
      this.files.findOne({ path: path }, (err, file) => {
        if (err) {
          reject(err);
        } else if (file) {
          if (file.isFolder === true) {
            resolve({
              isDir: true,
              isFile: false,
              lastModified: file.lastModified,
              size: 1, // TODO: real size
            });
          } else {
            resolve({
              isDir: false,
              isFile: true,
              lastModified: file.lastModified,
              size: 1, // TODO: real size
            });
          }
        } else if (!file) {
          // perhaps this is a folder
          this.files.findOne({ folder: path }, (err, file) => {
            if (err) {
              reject(err);
            } else if (!file) {
              if (path == '/') {
                console.log('Requested ROOT path', path);
                resolve({
                  isDir: true,
                  isFile: false,
                  lastModified: new Date(),
                  size: 0, // TODO: ??
                });
              } else {
                reject('path not found');
              }
            } else {
              resolve({
                isDir: true,
                isFile: false,
                // lastModified: file.lastModified,
                size: 0, // TODO: ??
              });
            }
          });
        }
      });
    });
  }

  async readFile(path: string): Promise<string> {
    console.log('MONGO READFILE', path);
    return new Promise((resolve, reject) => {
      this.files.findOne({ path: path }, (err, file) => {
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
    console.log('MONGO READDIR', path);
    return new Promise((resolve, reject) => {
      // find all files where the parent folder matches the specified path
      this.files.find({ folder: path }, 'path', {}, (err, files) => {
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
    console.log('MONGO EXISTS', path);
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await this.stat(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  async writeFile(path: string, content: any): Promise<void> {
    console.log('MONGO WRITEFILE', path);
    return new Promise((resolve, reject) => {
      const doc = {
        path: path,
        content: content,
        lastModified: new Date(),
        folder: pathLib.dirname(path),
      };

      this.files.findOneAndUpdate({ path: path }, doc, { upsert: true }, (err, updated) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async removeFile(path: string): Promise<void> {
    console.log('MONGO REMOVEFILE', path);
    return new Promise((resolve, reject) => {
      this.files.deleteOne({ path: path }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async mkDir(path: string, options?: MakeDirectoryOptions): Promise<void> {
    console.log('MONGO MKDIR', path);
    return new Promise((resolve, reject) => {
      const doc = {
        path: path,
        isFolder: true,
        lastModified: new Date(),
        folder: pathLib.dirname(path),
      };

      this.files.findOneAndUpdate({ path: path }, doc, { upsert: true }, (err, updated) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async rmDir(path: string): Promise<void> {
    console.log('MONGO RMDIR', path);
    // await rmDir(path);
    // noop required - there are no real folders, this is just part of the file records
  }

  async glob(pattern: string, path: string): Promise<string[]> {
    console.log('MONGO GLOB', pattern, path);
    return new Promise((resolve, reject) => {
      //convert the glob to a regexp
      let regex = globToRegExp(pattern, {globstar: true});

      // make sure the folder contains the root path but can also have other stuff
      let pathPattern = new RegExp(path + '.*');
      console.log('MONGO GLOB QUERY', regex, pathPattern);
      this.files.find({ path: regex, folder: pathPattern}, (err, files) => {
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
    let content = await this.readFile(src);
    return this.writeFile(dest, content);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const update = {
        path: newPath,
        lastModified: new Date(),
        folder: pathLib.dirname(newPath),
      };

      this.files.findOneAndUpdate({ path: oldPath }, update, {}, (err, updated) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}