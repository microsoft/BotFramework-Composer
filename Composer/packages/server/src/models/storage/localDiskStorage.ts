import fs from 'fs';

import { IFileStorage, Stat } from './interface';

import { promisify } from 'util';

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readDir);
const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);

export class LocalDiskStorage implements IFileStorage {
  statSync(path: string): Stat {
    const stat = await stat(path);
    return {
      isDir: stat.isDirectory(),
      isFile: stat.isFile(),
    };
  }

  readFileSync(path: string): string {
    return await readFile(path, 'utf-8');
  }

  readDirSync(path: string): string[] {
    return await readDir(path);
  }

  existSync(path: string): boolean {
    return await exists(path);
  }

  writeFileSync(path: string, content: any): void {
    return await writeFile(path, content);
  }
}
