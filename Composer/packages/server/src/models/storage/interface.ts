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
  glob(pattern: string, path: string): Promise<string[]>;
}
