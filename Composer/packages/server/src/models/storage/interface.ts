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
export interface StorageConnection {
  id: string;
  type: 'LocalDisk' | 'AzureBlobStorage';
  path: string;
  [key: string]: string;
}

export interface Stat {
  isDir: boolean;
  isFile: boolean;
  lastModified: string;
  size: string;
}

export interface MakeDirectoryOptions {
  recursive?: boolean;
}

export interface IFileStorage {
  stat(path: string): Promise<Stat>;
  readFile(path: string): Promise<string>;
  readDir(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  writeFile(path: string, content: any): Promise<void>;
  removeFile(path: string): Promise<void>;
  mkDir(path: string, options?: MakeDirectoryOptions): Promise<void>;
  rmDir(path: string): Promise<void>;
  glob(pattern: string, path: string): Promise<string[]>;
  copyFile(src: string, dest: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
}
