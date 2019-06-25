import ludown from 'ludown';

import { Path } from '../../../utility/path';

import { FileInfo, LUFile } from './../interface';

const parseContent = async (content: string) => {
  const log = false;
  const locale = 'en-us';
  try {
    return await ludown.parser.parseFile(content, log, locale);
  } catch (e) {
    return e;
  }
};

export class LUIndexer {
  private luFiles: LUFile[] = [];

  public async index(files: FileInfo[]) {
    if (files.length === 0) return [];
    this.luFiles = [];
    for (const file of files) {
      const extName = Path.extname(file.name);
      if (extName === '.lu') {
        const parsedContent = await parseContent(file.content);
        this.luFiles.push({
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
}
