import { IFileStorage } from './interface';
export declare function copyDir(srcDir: string, srcStorage: IFileStorage, dstDir: string, dstStorage: IFileStorage, pathsToExclude?: Set<string>): Promise<void>;
