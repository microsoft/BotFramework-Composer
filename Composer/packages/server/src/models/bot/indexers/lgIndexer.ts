import { Path } from '../../../utility/path';
import { FileInfo, LGFile } from '../interface';

export class LGIndexer {
  private lgFiles: LGFile[] = [];

  public index(files: FileInfo[]) {
    if (files.length === 0) return [];
    this.lgFiles = [];
    for (const file of files) {
      const extName = Path.extname(file.name);
      // todo: use lg parser.
      if (extName === '.lg') {
        this.lgFiles.push({
          id: Path.basename(file.name, extName),
          relativePath: file.relativePath,
          content: file.content,
        });
      }
    }
  }

  public getLgFiles() {
    return this.lgFiles;
  }
}
