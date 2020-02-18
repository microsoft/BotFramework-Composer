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
const pathLib = require("path");
const mongoose = require("mongoose");
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
const cleanPath = (path) => {
    // if somehow there is a // in the path
    return path.replace(/\/\//g, '/').replace(/\\\\/g, '\\');
};
class MongoStorage {
    constructor(conn) {
        // connect to Mongo
        // TODO: make the connect string and options pull from the connection
        conn;
        mongoose.connect('mongodb://localhost:27017/composer', {});
        this.db = mongoose.connection;
        this.db.on('error', err => {
            throw new Error(err);
        });
        this.db.once('open', function () {
            // we're connected!
            // eslint-disable-next-line no-console
            // console.log('CONNECTED TO MONGO');
        });
        this.files = mongoose.model('file', fileSchema, 'files');
    }
    stat(path) {
        return __awaiter(this, void 0, void 0, function* () {
            path = cleanPath(path);
            return new Promise((resolve, reject) => {
                this.files.findOne({ path: path }, (err, file) => {
                    if (err) {
                        reject(err);
                    }
                    else if (file) {
                        if (file.isFolder === true) {
                            resolve({
                                isDir: true,
                                isFile: false,
                                lastModified: file.lastModified,
                                size: 1,
                            });
                        }
                        else {
                            resolve({
                                isDir: false,
                                isFile: true,
                                lastModified: file.lastModified,
                                size: 1,
                            });
                        }
                    }
                    else if (!file) {
                        // perhaps this is a folder
                        this.files.findOne({ folder: path }, (err, file) => {
                            if (err) {
                                reject(err);
                            }
                            else if (!file) {
                                if (path == '/') {
                                    resolve({
                                        isDir: true,
                                        isFile: false,
                                        lastModified: new Date(),
                                        size: 0,
                                    });
                                }
                                else {
                                    reject(`path ${path} not found`);
                                }
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
            path = cleanPath(path);
            return new Promise((resolve, reject) => {
                this.files.findOne({ path: path }, (err, file) => {
                    if (err) {
                        reject(err);
                    }
                    else if (!file) {
                        reject('File not found');
                    }
                    else {
                        resolve(file.content.replace(/^\uFEFF/, ''));
                    }
                });
            });
        });
    }
    readDir(path) {
        return __awaiter(this, void 0, void 0, function* () {
            path = cleanPath(path);
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
            path = cleanPath(path);
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
            path = cleanPath(path);
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
            path = cleanPath(path);
            return new Promise((resolve, reject) => {
                this.files.deleteOne({ path: path }, err => {
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
    mkDir(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            path = cleanPath(path);
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
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    rmDir(path) {
        return __awaiter(this, void 0, void 0, function* () {
            path = cleanPath(path);
            return new Promise((resolve, reject) => {
                // const root = pathLib.dirname(path);
                const pattern = new RegExp(path + '.*');
                // remove all files inside this folder, any subfolder, including the folder itself
                this.files.remove({ folder: pattern }, (err, removed) => {
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
    glob(pattern, path) {
        return __awaiter(this, void 0, void 0, function* () {
            path = cleanPath(path);
            return new Promise((resolve, reject) => {
                //convert the glob to a regexp
                const regex = globToRegExp(pattern, { globstar: true });
                // make sure the folder contains the root path but can also have other stuff
                const pathPattern = new RegExp(path + '.*');
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
            src = cleanPath(src);
            dest = cleanPath(dest);
            const content = yield this.readFile(src);
            return this.writeFile(dest, content);
        });
    }
    rename(oldPath, newPath) {
        return __awaiter(this, void 0, void 0, function* () {
            oldPath = cleanPath(oldPath);
            newPath = cleanPath(newPath);
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
exports.default = (composer) => __awaiter(void 0, void 0, void 0, function* () {
    // pass in the custom storage class that will override the default
    yield composer.setStorage(MongoStorage);
});
//# sourceMappingURL=index.js.map