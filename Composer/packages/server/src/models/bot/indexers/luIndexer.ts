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
      let diagostics = null;
      if (extName === '.lu') {
        let parsedContent = {};
        try {
          parsedContent = await parseContent(file.content);
        } catch (err) {
          /* eslint-disable no-console */
          console.error('Error parsing lu file content.');
          console.error(err);
          /* eslint-enable no-console */
          diagostics = err;
        }
        this.luFiles.push({
          diagostics,
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
