// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface StorageConnection {
  id: string;
  type: 'LocalDisk' | 'AzureBlobStorage';
  path: string;
  [key: string]: string;
}

export interface Stat {
  isDir: boolean;
  isFile: boolean;
  isWritable: boolean;
  lastModified: string;
  size: string;
}

export interface MakeDirectoryOptions {
  recursive?: boolean;
}

export interface UserIdentity {
  [key: string]: any;
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
