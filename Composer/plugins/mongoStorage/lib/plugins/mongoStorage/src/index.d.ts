import { StorageConnection, IFileStorage, MakeDirectoryOptions } from '../../../packages/server/src/models/storage/interface';
export declare class MongoStorage implements IFileStorage {
    private db;
    private files;
    constructor(conn: StorageConnection);
    stat(path: string): Promise<any>;
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
