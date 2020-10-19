import { IFileStorage } from './interface';
/**
 * Copy a dir from one storage to another storage
 * @param srcDir path of the src dir
 * @param srcStorage src storage
 * @param dstDir path of the dst dir
 * @param dstStorage dst storage
 */
export declare function copyDir(srcDir: string, srcStorage: IFileStorage, dstDir: string, dstStorage: IFileStorage): Promise<void>;
