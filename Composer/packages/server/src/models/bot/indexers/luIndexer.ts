import { Path } from '../../../utility/path';

import { FileInfo, LUFile } from './../interface';

export class LUIndexer {
  private luFiles: LUFile[] = [];

  public index(files: FileInfo[]) {
    if (files.length === 0) return [];
    this.luFiles = [];
    for (const file of files) {
      const extName = Path.extname(file.name);
      // todo: use lu parser.
      if (extName === '.lu') {
        this.luFiles.push({
          id: Path.basename(file.name, extName),
          relativePath: file.relativePath,
          content: file.content,
        });
      }
    }
  }

  public getLuFiles() {
    return this.luFiles;
  }
}
