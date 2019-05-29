import path from 'path';

import { IFileStorage } from 'src/models/storage/interface';

import { FileInfo, LGFile } from '../interface';

export class LGIndexer {
  private lgFiles: LGFile[] = [];
  private storage: IFileStorage;

  constructor(storage: IFileStorage) {
    this.storage = storage;
  }

  public index(files: FileInfo[]) {
    if (files.length === 0) return [];
    this.lgFiles = [];
    for (const file of files) {
      const extName = path.extname(file.name);
      // todo: use lg parser.
      if (extName === '.lg') {
        this.lgFiles.push({
          id: path.basename(file.name, extName),
          absolutePath: file.path,
          content: file.content,
        });
      }
    }
  }

  public getLgFiles() {
    return this.lgFiles;
  }

  public async updateLgFile(id: string, content: string) {
    const updatedIndex = this.lgFiles.findIndex(file => id === file.id);
    const absolutePath = this.lgFiles[updatedIndex].absolutePath;

    this.lgFiles[updatedIndex].content = content;

    await this.storage.writeFile(absolutePath, content);
    return content;
  }

  // id is file name
  public createLgFile = (id: string, content: string, absolutePath: string) => {
    this.lgFiles.push({ id, content: '', absolutePath });
    return content;
  };

  public removeLgFile = (id: string) => {
    const itemIndex = this.lgFiles.findIndex(lgFile => {
      return id === lgFile.id;
    });

    return this.lgFiles.splice(itemIndex, 1);
  };
}
