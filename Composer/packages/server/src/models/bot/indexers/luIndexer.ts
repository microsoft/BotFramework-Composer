import path from 'path';

import { IFileStorage } from 'src/models/storage/interface';

import { FileInfo, LUFile } from '../interface';

export class LUIndexer {
  private luFiles: LUFile[] = [];
  private storage: IFileStorage;

  constructor(storage: IFileStorage) {
    this.storage = storage;
  }

  public index(files: FileInfo[]) {
    if (files.length === 0) return [];
    this.luFiles = [];
    for (const file of files) {
      const extName = path.extname(file.name);
      // todo: use lu parser.
      if (extName === '.lu') {
        this.luFiles.push({
          id: path.basename(file.name, extName),
          absolutePath: file.path,
          // templates: [],
          content: file.content,
        });
      }
    }
  }

  public getLuFiles() {
    return this.luFiles;
  }

  public async updateLuFile(id: string, content: string) {
    const updatedIndex = this.luFiles.findIndex(file => id === file.id);
    const absolutePath = this.luFiles[updatedIndex].absolutePath;

    this.luFiles[updatedIndex].content = content;

    await this.storage.writeFile(absolutePath, content);
    return content;
  }

  // id is file name
  public createLuFile = (id: string, content: string, absolutePath: string) => {
    this.luFiles.push({ id, content: '', absolutePath });
    return content;
  };

  public removeLuFile = (id: string) => {
    const itemIndex = this.luFiles.findIndex(luFile => {
      return id === luFile.id;
    });

    return this.luFiles.splice(itemIndex, 1);
  };
}
