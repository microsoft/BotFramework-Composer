export interface IStorageProvider {
  deleteFile(reqPath: string): Promise<any>;
  isValidate(reqPath: string): boolean;
  listFiles(path: string): Promise<any>;
  readFile(path: string): Promise<any>;
  writeFile(name: string, content: any, path: string): Promise<any>; // update or create
  rmdir(reqPath: string): Promise<any>;
}
