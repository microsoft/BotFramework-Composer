import { LGParser } from 'botbuilder-lg';

import { Path } from '../../../utility/path';
import { FileInfo, LGFile } from '../interface';

export class LGIndexer {
  private lgFiles: LGFile[] = [];

  public index(files: FileInfo[]) {
    if (files.length === 0) return [];
    this.lgFiles = [];
    for (const file of files) {
      const extName = Path.extname(file.name);
      const isValid = this.validate(file.content).isValid;
      if (extName === '.lg') {
        this.lgFiles.push({
          id: Path.basename(file.name, extName),
          relativePath: file.relativePath,
          content: file.content,
          isValid,
        });
      }
    }
  }

  public getLgFiles() {
    return this.lgFiles;
  }

  public validate(content: string) {
    return LGParser.TryParse(content);
  }
}
