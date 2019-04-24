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

export interface IFileStorage {
  // TODO: we probably should include glob pattern here

  stat(path: string): Promise<Stat>;
  readFile(path: string): Promise<string>;
  readDir(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  writeFile(path: string, content: any): Promise<void>;
  mkDir(path: string): Promise<void>;
  filesFilter(path: string, pattern: string): Promise<string[]>;
}
