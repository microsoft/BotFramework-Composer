import { Path } from '../../../utility/path';

import { IFileStorage } from './../../storage/interface';
import { FileInfo, LUFile } from './../interface';

export class LUIndexer {
  private luFiles: LUFile[] = [];
  private storage: IFileStorage;
  private dir: string;

  constructor(storage: IFileStorage, dir: string) {
    this.storage = storage;
    this.dir = dir;
  }

  public index(files: FileInfo[]) {
    if (files.length === 0) return [];
    this.luFiles = [];
    for (const file of files) {
      const extName = Path.extname(file.name);
      // todo: use lu parser.
      if (extName === '.lu') {
        this.luFiles.push({
          id: Path.basename(file.name, extName),
          relativePath: Path.relative(this.dir, file.path),
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
    const relativePath = this.luFiles[updatedIndex].relativePath;
    const absolutePath = Path.join(this.dir, relativePath);

    this.luFiles[updatedIndex].content = content;

    await this.storage.writeFile(absolutePath, content);
    return content;
  }

  // id is file name
  public createLuFile = (id: string, content: string, relativePath: string) => {
    this.luFiles.push({ id, content, relativePath });
    return content;
  };

  public removeLuFile = (id: string) => {
    const itemIndex = this.luFiles.findIndex(luFile => {
      return id === luFile.id;
    });

    return this.luFiles.splice(itemIndex, 1);
  };
}
