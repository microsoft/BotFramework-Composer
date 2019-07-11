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
      if (extName === '.lg') {
        const error = this.parse(file.content).error;

        this.lgFiles.push({
          id: Path.basename(file.name, extName),
          relativePath: file.relativePath,
          content: file.content,
          diagostics: error === undefined ? [] : [error],
        });
      }
    }
  }

  public getLgFiles() {
    return this.lgFiles;
  }

  public parse(content: string) {
    // TODO update lg-parser, use new diagostic method

    return LGParser.TryParse(content);
  }
}
