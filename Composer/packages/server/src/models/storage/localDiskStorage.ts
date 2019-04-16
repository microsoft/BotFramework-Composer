import fs from 'fs';
import { promisify } from 'util';

import { IFileStorage, Stat } from './interface';

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);

export class LocalDiskStorage implements IFileStorage {
  async stat(path: string): Promise<Stat> {
    const fstat = await stat(path);
    return {
      isDir: fstat.isDirectory(),
      isFile: fstat.isFile(),
    };
  }

  async readFile(path: string): Promise<string> {
    return await readFile(path, 'utf-8');
  }

  async readDir(path: string): Promise<string[]> {
    return await readDir(path);
  }

  async exists(path: string): Promise<boolean> {
    return await exists(path);
  }

  async writeFile(path: string, content: any): Promise<void> {
    return await writeFile(path, content);
  }
}
