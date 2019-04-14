import { IFileStorage, Stat } from './interface';
import fs from 'fs';

export class LocalDiskStorage implements IFileStorage {
  statSync(path: string): Stat {
    const stat = fs.statSync(path);
    return {
      isDir: stat.isDirectory(),
      isFile: stat.isFile(),
    };
  }

  readFileSync(path: string): string {
    return fs.readFileSync(path, 'utf-8');
  }

  readDirSync(path: string): string[] {
    return fs.readdirSync(path);
  }

  existSync(path: string): boolean {
    return fs.existsSync(path);
  }
}
