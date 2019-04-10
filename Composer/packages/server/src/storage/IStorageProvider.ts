export interface IStorageProvider {
  // use in projectHandler
  updateFile(name: string, content: any, reqPath: string): Promise<any>;
  getBotProject(reqPath: string): Promise<any>;
  createFile(name: string, steps: string[], reqPath: string): Promise<any>;
  deleteFile(): any;
  isValidate(): boolean;

  // use in storageHandler
  // async function, path can be absolute path or url
  getFilesAndFoldersByPath(path: string): Promise<any>;
}
