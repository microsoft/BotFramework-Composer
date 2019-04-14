export interface StorageConnection {
  id: string;
  type: 'LocalDisk' | 'AzureBlobStorage';
  [key: string]: string;
}

export interface Stat {
  isDir: boolean;
  isFile: boolean;
}

export interface IFileStorage {
  statSync(path: string): Stat;
  readFileSync(path: string): string;
  readDirSync(path: string): string[];
  existSync(path: string): boolean;

  // TODO: we probably should include glob pattern here
}
