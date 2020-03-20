"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const pathLib = require("path");
const globToRegExp = require("glob-to-regexp");
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
class MongoStorage {
    // private folders: any;
    constructor(conn) {
        // connect to Mongo
        // TODO: make the connect string and options pull from the connection
        conn;
        mongoose.connect('mongodb://localhost:27017/composer', {});
        this.db = mongoose.connection;
        this.files = mongoose.model('file', fileSchema, 'files');
        // this.folders = mongoose.model('folder', folderSchema, 'folders');
    }
    stat(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.files.findOne({ path: path }, (err, file) => {
                    if (err) {
                        reject(err);
                    }
                    else if (file) {
                        resolve({
                            isDir: false,
                            isFile: true,
                            lastModified: file.lastModified,
                            size: 1,
                        });
                    }
                    else if (!file) {
                        // perhaps this is a folder
                        this.files.findOne({ folder: path }, (err, file) => {
                            if (err) {
                                reject(err);
                            }
                            else if (!file) {
                                reject('path not found');
                            }
                            else {
                                resolve({
                                    isDir: true,
                                    isFile: false,
                                    lastModified: file.lastModified,
                                    size: 0,
                                });
                            }
                        });
                    }
                });
            });
        });
    }
    readFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.files.findOne({ path: path }, (err, file) => {
                    if (err) {
                        reject(err);
                    }
                    else if (!file) {
                        reject('File not found');
                    }
                    else {
                        resolve(file.content);
                    }
                });
            });
        });
    }
    readDir(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // find all files where the parent folder matches the specified path
                this.files.find({ folder: path }, 'path', {}, (err, files) => {
                    if (err) {
                        reject(err);
                    }
                    else if (!files) {
                        reject('Folder not found');
                    }
                    else {
                        // strip off the path, leaving just the filename
                        resolve(files.map(item => {
                            return item.path.replace(path, '');
                        }));
                    }
                });
            });
        });
    }
    exists(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                yield this.stat(path);
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
    writeFile(path, content) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    removeFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.files.deleteOne({ path: path }, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
            // await removeFile(path);
        });
    }
    mkDir(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // await mkDir(path, options);
            // noop required - there are no real folders, this is just part of the file records
        });
    }
    rmDir(path) {
        return __awaiter(this, void 0, void 0, function* () {
            // await rmDir(path);
            // noop required - there are no real folders, this is just part of the file records
        });
    }
    glob(pattern, path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                //convert the glob to a regexp
                let regex = globToRegExp(pattern, { globstar: true });
                // make sure the folder contains the root path but can also have other stuff
                let pathPattern = new RegExp(path + '.*');
                this.files.find({ path: regex, folder: pathPattern }, (err, files) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        // strip off the path, leaving just the filename
                        resolve(files.map(item => {
                            return item.path.replace(path, '');
                        }));
                    }
                });
            });
        });
    }
    copyFile(src, dest) {
        return __awaiter(this, void 0, void 0, function* () {
            let content = yield this.readFile(src);
            return this.writeFile(dest, content);
        });
    }
    rename(oldPath, newPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const update = {
                    path: newPath,
                    lastModified: new Date(),
                    folder: pathLib.dirname(newPath),
                };
                this.files.findOneAndUpdate({ path: oldPath }, update, {}, (err, updated) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
}
exports.MongoStorage = MongoStorage;
//# sourceMappingURL=index.js.map