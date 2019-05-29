import fs from 'fs';
import { promisify } from 'util';

import glob from 'globby';

import { IFileStorage, Stat } from './interface';

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.unlink);
const mkDir = promisify(fs.mkdir);

export class LocalDiskStorage implements IFileStorage {
  async stat(path: string): Promise<Stat> {
    try {
      const fstat = await stat(path);
      return {
        isDir: fstat.isDirectory(),
        isFile: fstat.isFile(),
        lastModified: fstat.ctime.toString(),
        size: fstat.isFile() ? fstat.size.toString() : '',
      };
    } catch (error) {
      console.log(`STAT ${error}`);
      throw error;
    }
  }

  async readFile(path: string): Promise<string> {
    const raw = await readFile(path, 'utf-8');
    return raw.replace(/^\uFEFF/, ''); // UTF-8 BOM: https://github.com/nodejs/node-v0.x-archive/issues/1918
  }

  async readDir(path: string): Promise<string[]> {
    return await readDir(path);
  }

  async exists(path: string): Promise<boolean> {
    return await exists(path);
  }

  async writeFile(path: string, content: any): Promise<void> {
    await writeFile(path, content);
  }

  async removeFile(path: string): Promise<void> {
    await removeFile(path);
  }

  async mkDir(path: string): Promise<void> {
    await mkDir(path);
  }

  async glob(pattern: string, path: string): Promise<string[]> {
    return await glob(pattern, { cwd: path });
  }
}
