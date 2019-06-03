import path from 'path';

import { IFileStorage } from 'src/models/storage/interface';

import { FileInfo, LGFile } from '../interface';

export class LGIndexer {
  private lgFiles: LGFile[] = [];
  private storage: IFileStorage;
  private dir: string;

  constructor(storage: IFileStorage, dir: string) {
    this.storage = storage;
    this.dir = dir;
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
          relativePath: path.relative(this.dir, file.path),
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
    const relativePath = this.lgFiles[updatedIndex].relativePath;
    const absolutePath = path.join(this.dir, relativePath);

    this.lgFiles[updatedIndex].content = content;

    await this.storage.writeFile(absolutePath, content);
    return content;
  }

  // id is file name
  public createLgFile = (id: string, content: string, relativePath: string) => {
    this.lgFiles.push({ id, content: '', relativePath });
    return content;
  };

  public removeLgFile = (id: string) => {
    const itemIndex = this.lgFiles.findIndex(lgFile => {
      return id === lgFile.id;
    });

    return this.lgFiles.splice(itemIndex, 1);
  };
}
