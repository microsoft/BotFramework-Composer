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

export interface IFileStorage {
  stat(path: string): Promise<Stat>;
  statSync(path: string): Stat;
  readFile(path: string): Promise<string>;
  readFileSync(path: string): string;
  readDir(path: string): Promise<string[]>;
  readDirSync(path: string): string[];
  exists(path: string): Promise<boolean>;
  existsSync(path: string): boolean;
  writeFile(path: string, content: any): Promise<void>;
  writeFileSync(path: string, content: any): void;
  removeFile(path: string): Promise<void>;
  removeFileSync(path: string): void;
  mkDir(path: string, options?: MakeDirectoryOptions): Promise<void>;
  mkDirSync(path: string, options?: MakeDirectoryOptions): void;
  rmDir(path: string): Promise<void>;
  rmDirSync(path: string): void;
  rmrfDir(path: string): Promise<void>;
  rmrfDirSync(path: string): void;
  glob(pattern: string | string[], path: string): Promise<string[]>;
  globSync(pattern: string | string[], path: string): string[];
  copyFile(src: string, dest: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  zip(source: string, exclusions: { files: string[]; directories: string[] }, cb: any): unknown;
}
