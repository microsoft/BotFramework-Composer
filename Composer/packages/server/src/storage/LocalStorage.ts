import fs from 'fs';
import { IStorageProvider } from './IStorageProvider';
import path from 'path';
import { promisify } from 'util';

const fsStat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readDir = promisify(fs.readdir);
const removeDir = promisify(fs.rmdir);

export class LocalStorage implements IStorageProvider {
  private rootPath: string; // absolute path
  constructor(root: string) {
    this.rootPath = path.normalize(root);
    this.rootPath = path.resolve(this.rootPath);
    if (!fs.existsSync(this.rootPath)) {
      throw new Error('path not validate');
    }
  }
  async readFile(reqPath: string): Promise<any> {
    try {
      if (!path.isAbsolute(reqPath)) {
        reqPath = LocalStorage.pathToAbsolute(reqPath);
      }
      if (fs.existsSync(reqPath)) {
        return await readFile(reqPath, 'utf-8');
      } else {
        throw new Error('file not exist');
      }
    } catch (error) {
      throw error;
    }
  }
  async writeFile(name: string, content: any, reqPath: string): Promise<any> {
    try {
      if (!path.isAbsolute(reqPath)) {
        reqPath = LocalStorage.pathToAbsolute(reqPath);
      }
      if (path.extname(reqPath) === '') {
        reqPath = `${reqPath}/${name}`;
      } else {
        reqPath = `${path.posix.dirname(reqPath)}/${name}`;
      }
      if (this.isValidate(reqPath)) {
        return await writeFile(reqPath, content);
      } else {
        throw new Error('file not found or no permission to access this file');
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(reqPath: string) {
    if (!path.isAbsolute(reqPath)) {
      reqPath = LocalStorage.pathToAbsolute(reqPath);
    }
    if (this.isValidate(reqPath)) {
      return await fs.unlink(reqPath, err => {
        if (err) throw err;
        console.log('successfully deleted');
      });
    } else {
      throw new Error('no permission to access this file');
    }
  }

  async rmdir(reqPath: string) {
    if (!path.isAbsolute(reqPath)) {
      reqPath = LocalStorage.pathToAbsolute(reqPath);
    }
    if (!fs.statSync(reqPath).isDirectory()) {
      throw new Error('path is not dir');
    }
    if (this.isValidate(reqPath)) {
      return await removeDir(reqPath);
    } else {
      throw new Error('no permission to access this file');
    }
  }

  isValidate(reqPath: string): boolean {
    // check if the path is correct, and under the rootpath
    if (reqPath === this.rootPath) return false;
    const parentTokens = this.rootPath.split('/').filter(i => i.length);
    return parentTokens.every((t, i) => reqPath.split('/')[i] === t);
  }

  public static pathToAbsolute(reqPath: string) {
    return path.resolve(reqPath).replace(/\\/g, '/');
  }
  public static pathToRelative(reqPath: string) {
    const rootPath = process.cwd();
    return path.relative(rootPath, reqPath).replace(/\\/g, '/');
  }
  public async listFiles(reqPath: string) {
    if (!path.isAbsolute(reqPath)) {
      reqPath = LocalStorage.pathToAbsolute(reqPath);
    }
    if (reqPath !== this.rootPath && !this.isValidate(reqPath)) {
      throw new Error('no permission to access this path');
    }
    const stat = await fsStat(reqPath);
    let result;
    if (stat.isFile()) {
      result = fs.readFileSync(reqPath, 'utf-8');
      result = JSON.parse(result);
    } else if (stat.isDirectory()) {
      const folderTree = await this.getFolderTree(reqPath);
      result = {
        name: path.basename(reqPath),
        parent: path.dirname(reqPath).replace(/\\/g, '/'),
        children: folderTree,
      };
    }
    return result;
  }
  // get files and folders from local drive
  private async getFolderTree(folderPath: string) {
    try {
      return await readDir(folderPath);
    } catch (error) {
      throw error;
    }

    // const folderTree = [] as object[];
    // const items = fs.readdirSync(folderPath);
    // for (const item of items) {
    //   try {
    //     const itemPath = path.join(folderPath, item);
    //     const tempStat = fs.statSync(itemPath);
    //     if (tempStat.isDirectory()) {
    //       folderTree.push({
    //         name: item,
    //         type: 'folder',
    //         path: itemPath.replace(/\\/g, '/'),
    //         lastModified: tempStat.mtimeMs,
    //       });
    //     } else if (tempStat.isFile()) {
    //       folderTree.push({
    //         name: item,
    //         size: tempStat.size,
    //         type: 'file',
    //         lastModified: tempStat.mtimeMs,
    //         path: itemPath.replace(/\\/g, '/'),
    //       });
    //     }
    //   } catch (error) {
    //     // log error, and continute getting the path which can access
    //     console.log(error);
    //     continue;
    //   }
    // }
    // return folderTree;
  }
}
