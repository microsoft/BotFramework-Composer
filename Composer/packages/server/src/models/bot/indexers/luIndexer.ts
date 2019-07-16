import ludown from 'ludown';

import { Path } from '../../../utility/path';

import { FileInfo, LUFile } from './../interface';

const parseContent = (content: string): Promise<any> => {
  const log = false;
  const locale = 'en-us';

  return ludown.parser.parseFile(content, log, locale);
};

export class LUIndexer {
  private luFiles: LUFile[] = [];

  public async index(files: FileInfo[]) {
    if (files.length === 0) return [];
    this.luFiles = [];
    for (const file of files) {
      const extName = Path.extname(file.name);
      if (extName === '.lu') {
        const diagnostics = [];
        let parsedContent = {};
        try {
          parsedContent = await parseContent(file.content);
        } catch (err) {
          diagnostics.push(err);
        }
        this.luFiles.push({
          diagnostics,
          id: Path.basename(file.name, extName),
          relativePath: file.relativePath,
          content: file.content,
          parsedContent,
        });
      }
    }
  }

  public getLuFiles() {
    return this.luFiles;
  }

  public parse(content: string) {
    // TODO update lg-parser, use new diagostic method

    return parseContent(content);
  }
}
