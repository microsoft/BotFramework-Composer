import ludown from 'ludown';

import { Path } from '../../../utility/path';

import { FileInfo, LUFile } from './../interface';
import { IFileStorage } from './../../storage/interface';
import { ILuisStatus, ILuisStatusOperation } from './../../bot/interface';
const parseContent = (content: string): Promise<any> => {
  const log = false;
  const locale = 'en-us';

  return ludown.parser.parseFile(content, log, locale);
};

const GENERATEDFOLDER = 'generated';
const luisStatusFileName = 'luis.status.json';
export class LUIndexer {
  private luFiles: LUFile[] = [];

  private dir: string;
  public storage: IFileStorage;
  constructor(storage: IFileStorage, dir: string) {
    this.storage = storage;
    this.dir = dir;
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

    const luStatusFile = files.find(file => file.name === luisStatusFileName);
    if (luStatusFile) {
      const luStatuses = await this._getLuStatus(luStatusFile.path);
      this.luFiles.forEach(luFile => {
        const lastUpdateTime = luStatuses[luFile.id].lastUpdateTime;
        const lastPublishTime = luStatuses[luFile.id].lastPublishTime;

        luFile.lastUpdateTime = lastUpdateTime;
        luFile.lastPublishTime = lastPublishTime;
      });
    }
  }

  public getLuFiles() {
    return this.luFiles;
  }

  public async flush(files: FileInfo[], relativePath?: string) {
    //write into lu file
    if (relativePath) {
      const index = files.findIndex(f => f.relativePath === relativePath);
      if (index === -1) {
        throw new Error(`no such file at ${relativePath}`);
      }
      const absolutePath = `${this.dir}/${relativePath}`;
      await this.storage.writeFile(absolutePath, files[index].content);
    }
    //write into lu status
    const luisStatus: ILuisStatus = {};
    for (const file of this.luFiles) {
      luisStatus[file.id] = {
        lastUpdateTime: file.lastUpdateTime,
        lastPublishTime: file.lastPublishTime,
      };
    }
    if (!(await this.storage.exists(Path.join(this.dir, GENERATEDFOLDER)))) {
      await this.storage.mkDir(Path.join(this.dir, GENERATEDFOLDER));
    }
    await this.storage.writeFile(
      Path.join(this.dir, GENERATEDFOLDER, luisStatusFileName),
      JSON.stringify(luisStatus, null, 4)
    );
    // if files does not contain the luis.status.json we need to add it
    if (!files.find(file => file.name === luisStatusFileName)) {
      files.push({
        name: luisStatusFileName,
        content: await this.storage.readFile(Path.join(this.dir, GENERATEDFOLDER, luisStatusFileName)),
        path: Path.join(this.dir, GENERATEDFOLDER, luisStatusFileName),
        relativePath: Path.relative(this.dir, Path.join(this.dir, GENERATEDFOLDER, luisStatusFileName)),
      });
    }
  }

  public parse(content: string) {
    // TODO update lg-parser, use new diagostic method

    return parseContent(content);
  }

  public updateLuInMemory(data: ILuisStatusOperation, operation: string, files: FileInfo[], content?: string) {
    switch (operation) {
      case 'update':
        for (const id in data) {
          const curLuFile = this.luFiles.find(luFile => luFile.id === id);
          const file = files.find(f => f.name === `${id}.lu`);
          if (!curLuFile || !file) break;
          const newLuFile = data[id];
          for (const key in newLuFile) {
            curLuFile[key] = newLuFile[key];
          }
          file.content = content;
        }
        break;
      case 'publish':
        for (const id in data) {
          const curLuFile = this.luFiles.find(luFile => luFile.id === id);
          const file = files.find(f => f.name === `${id}.lu`);
          if (!curLuFile || !file) break;
          const newLuFile = data[id];
          for (const key in newLuFile) {
            curLuFile[key] = newLuFile[key];
          }
        }
        break;
      case 'remove':
        break;
      case 'create':
        break;
    }
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
