import ludown from 'ludown';

import { Path } from '../../../utility/path';

import { FileInfo, LUFile } from './../interface';
import { IFileStorage } from './../../storage/interface';
const parseContent = (content: string): Promise<any> => {
  const log = false;
  const locale = 'en-us';

  return ludown.parser.parseFile(content, log, locale);
};

export class LUIndexer {
  private luFiles: LUFile[] = [];
  private luisStatusFileName = 'luis.status.json';
  public storage: IFileStorage;
  constructor(storage: IFileStorage) {
    this.storage = storage;
  }

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
          lastUpdateTime: 1,
          lastPublishTime: 1,
        });
      }
    }

    const luStatusFile = files.find(file => file.name === this.luisStatusFileName);
    if (luStatusFile) {
      const luStatuses = await this._getLuStatus(luStatusFile.path);

      for (const luName in luStatuses) {
        const lastUpdateTime = luStatuses[luName].lastUpdateTime;
        const lastPublishTime = luStatuses[luName].lastPublishTime;
        const luFile = this.luFiles.find(lufile => lufile.id === luName);
        if (luFile) {
          luFile['lastUpdateTime'] = lastUpdateTime;
          luFile['lastPublishTime'] = lastPublishTime;
        }
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

  private _getLuStatus = async (path: string) => {
    return await this._getJsonObject(path);
  };

  private _getJsonObject = async (path: string) => {
    if (await this.storage.exists(path)) {
      const json = await this.storage.readFile(path);
      return JSON.parse(json);
    } else {
      return null;
    }
  };
}
