import fs from 'fs';
import { IStorageProvider } from './IStorageProvider';
import path from 'path';
import { promisify } from 'util';

import { getFiles, updateFile, createFromTemplate } from '../handlers/fileHandler';

const fsStat = promisify(fs.stat);

export class LocalStorage implements IStorageProvider {
  private rootPath: string; // absolute path
  constructor(root: string) {
    this.rootPath = path.normalize(root);
    this.rootPath = path.resolve(this.rootPath);
    if (!this.isValidate()) {
      throw new Error('path not validate');
    }
  }
  async updateFile(name: string, content: any, reqPath: string) {
    if (this.isChildPath(reqPath) && fs.existsSync(reqPath)) {
      return await updateFile(name, content, reqPath);
    } else {
      throw new Error('file not found or no permission to access this file');
    }
  }
  async getBotProject(reqPath: string) {
    if (this.isChildPath(reqPath)) {
      return await getFiles(LocalStorage.pathToAbsolute(reqPath));
    } else {
      throw new Error('no permission to access this file');
    }
  }
  async createFile(name: string, steps: string[], reqPath: string = '') {
    if (this.isChildPath(reqPath)) {
      return await createFromTemplate(name, steps, reqPath);
    } else {
      throw new Error('no permission to access this file');
    }
  }
  deleteFile() {
    throw new Error('Method not implemented.');
  }

  isValidate(): boolean {
    // check if the path is correct
    if (!fs.existsSync(this.rootPath)) {
      return false;
    } else {
      return true;
    }
  }
  public static isBotProj(reqPath: string): boolean {
    if (!reqPath || (path.extname(reqPath) !== '.bot' && path.extname(reqPath) !== '.botproj')) {
      return false;
    }
    return true;
  }
  public static pathToAbsolute(reqPath: string) {
    return path.resolve(reqPath).replace(/\\/g, '/');
  }
  public static pathToRelative(reqPath: string) {
    const rootPath = process.cwd();
    return path.relative(rootPath, reqPath).replace(/\\/g, '/');
  }
  private isChildPath(reqPath: string): boolean {
    if (reqPath === this.rootPath) return false;
    const parentTokens = this.rootPath.split('/').filter(i => i.length);
    return parentTokens.every((t, i) => reqPath.split('/')[i] === t);
  }
  public async getFilesAndFoldersByPath(reqPath: string) {
    if (!path.isAbsolute(reqPath)) {
      throw { error: 'path is not absolute path' };
    }

    const stat = await fsStat(reqPath);
    reqPath = path.normalize(reqPath);
    let result;
    if (stat.isFile()) {
      result = fs.readFileSync(reqPath, 'utf-8');
      result = JSON.parse(result);
    } else if (stat.isDirectory()) {
      const folderTree = this.getFolderTree(reqPath);
      result = {
        name: path.basename(reqPath),
        parent: path.dirname(reqPath).replace(/\\/g, '/'),
        children: folderTree,
      };
    }
    return result;
  }
  // get files and folders from local drive
  private getFolderTree(folderPath: string) {
    const folderTree = [] as object[];
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
      try {
        const itemPath = path.join(folderPath, item);
        const tempStat = fs.statSync(itemPath);
        if (tempStat.isDirectory()) {
          folderTree.push({
            name: item,
            type: 'folder',
            path: itemPath.replace(/\\/g, '/'),
            lastModified: tempStat.mtimeMs,
          });
        } else if (tempStat.isFile()) {
          folderTree.push({
            name: item,
            size: tempStat.size,
            type: 'file',
            lastModified: tempStat.mtimeMs,
            path: itemPath.replace(/\\/g, '/'),
          });
        }
      } catch (error) {
        // log error, and continute getting the path which can access
        console.log(error);
        continue;
      }
    }
    return folderTree;
  }
}
