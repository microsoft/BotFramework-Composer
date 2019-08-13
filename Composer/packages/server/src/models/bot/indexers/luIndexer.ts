import ludown from 'ludown';

import { Path } from '../../../utility/path';

import { FileInfo, LUFile } from './../interface';
import { IFileStorage } from './../../storage/interface';
import { ILuisStatus, ILuisStatusOperation } from './../../bot/interface';

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
          parsedContent = await this.parse(file.content);
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
  //flush after updating, publishing, creating and removing lu file
  //only flush after publishing does not have the relativePath parameter
  public async flush(files: FileInfo[], relativePath?: string) {
    //operation on .lu file
    if (relativePath) {
      const existInFiles = files.findIndex(f => f.relativePath === relativePath) !== -1;
      const existInLuFiles = this.luFiles.findIndex(f => f.relativePath === relativePath) !== -1;
      const existInDisk = await this.storage.exists(Path.join(this.dir, relativePath));
      if (existInFiles !== existInLuFiles) {
        throw new Error('files and luFiles are not consistent in memory');
      }
      const existInMemory = existInFiles;

      if (existInMemory) {
        //flush after update or create
        const index = files.findIndex(f => f.relativePath === relativePath);
        const absolutePath = `${this.dir}/${relativePath}`;
        !existInDisk && (await this.ensureDirExists(Path.dirname(absolutePath))); //make sure the dir exist before creating a new file
        await this.storage.writeFile(absolutePath, files[index].content);
      } else if (!existInMemory && existInDisk) {
        //remove a file in disk
        const absolutePath = `${this.dir}/${relativePath}`;
        await this.storage.removeFile(absolutePath);
      } else {
        throw new Error(`no such file at ${relativePath}`);
      }
    }

    //write into luis.status.json
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

  public parse(content: string): Promise<any> {
    const log = false;
    const locale = 'en-us';

    return ludown.parser.parseFile(content, log, locale);
  }

  public updateLuInMemoryIfUpdate(files: FileInfo[], data: ILuisStatusOperation, content: string) {
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
  }

  public updateLuInMemoryIfPublish(files: FileInfo[], data: ILuisStatusOperation) {
    for (const id in data) {
      const curLuFile = this.luFiles.find(luFile => luFile.id === id);
      const file = files.find(f => f.name === `${id}.lu`);
      if (!curLuFile || !file) break;
      const newLuFile = data[id];
      for (const key in newLuFile) {
        curLuFile[key] = newLuFile[key];
      }
    }
  }

  public async updateLuInMemoryIfCreate(files: FileInfo[], content: string, relativePath: string, id: string) {
    const absolutePath = Path.resolve(this.dir, relativePath);
    const diagnostics = [];
    let parsedContent = {};
    try {
      parsedContent = await parseContent(content);
    } catch (err) {
      diagnostics.push(err);
    }
    this.luFiles.push({
      diagnostics,
      id,
      relativePath,
      content,
      parsedContent,
      lastUpdateTime: 1,
      lastPublishTime: 1,
    });

    files.push({
      name: Path.basename(relativePath),
      content: content,
      path: absolutePath,
      relativePath: relativePath,
    });
  }

  public updateLuInMemoryIfRemove(files: FileInfo[], relativePath: string, id: string) {
    const i1 = files.findIndex(f => f.relativePath === relativePath);
    if (i1 === -1) {
      throw new Error(`no such file at ${relativePath}`);
    }
    const i2 = this.luFiles.findIndex(lu => lu.id === id);
    if (i2 === -1) {
      throw new Error(`no such lu file ${id}`);
    }
    files.splice(i1, 1);
    this.luFiles.splice(i2, 1);
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

  private ensureDirExists = async (dir: string) => {
    if (!dir || dir === '.') {
      return;
    }
    if (!(await this.storage.exists(dir))) {
      await this.storage.mkDir(dir, { recursive: true });
    }
  };
}
