/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import fs from 'fs';
import { promisify } from 'util';

import glob from 'globby';

import { IFileStorage, Stat, MakeDirectoryOptions } from './interface';

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.unlink);
const mkDir = promisify(fs.mkdir);
const rmDir = promisify(fs.rmdir);
const copyFile = promisify(fs.copyFile);
const rename = promisify(fs.rename);

export class LocalDiskStorage implements IFileStorage {
  async stat(path: string): Promise<Stat> {
    try {
      const fstat = await stat(path);
      return {
        isDir: fstat.isDirectory(),
        isFile: fstat.isFile(),
        lastModified: fstat.ctime.toString(),
        size: fstat.isFile() ? fstat.size.toString() : '',
      };
    } catch (error) {
      throw error;
    }
  }

  async readFile(path: string): Promise<string> {
    const raw = await readFile(path, 'utf-8');
    return raw.replace(/^\uFEFF/, ''); // UTF-8 BOM: https://github.com/nodejs/node-v0.x-archive/issues/1918
  }

  async readDir(path: string): Promise<string[]> {
    return await readDir(path);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await stat(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  async writeFile(path: string, content: any): Promise<void> {
    await writeFile(path, content);
  }

  async removeFile(path: string): Promise<void> {
    await removeFile(path);
  }

  async mkDir(path: string, options?: MakeDirectoryOptions): Promise<void> {
    await mkDir(path, options);
  }

  async rmDir(path: string): Promise<void> {
    await rmDir(path);
  }

  async glob(pattern: string, path: string): Promise<string[]> {
    return await glob(pattern, { cwd: path, dot: true });
  }

  async copyFile(src: string, dest: string): Promise<void> {
    return await copyFile(src, dest);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    return await rename(oldPath, newPath);
  }
}
