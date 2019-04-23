import path from 'path';

import { merge, set } from 'lodash';
import glob from 'globby';

import { Store } from '../../store/store';

import DIALOG_TEMPLATE from './../../store/dialogTemplate.json';
import { IFileStorage, StorageConnection } from './../storage/interface';
import { StorageFactory } from './../storage/storageFactory';
import { BotProjectRef, FileInfo, BotProjectFileContent } from './interface';
import { DialogIndexer } from './indexers/dialogIndexers';

// TODO:
// 1. refactor this class to use on IFileStorage instead of operating on fs
// 2. refactor this layer, to operate on dialogs, not files
export class BotProject {
  public ref: BotProjectRef;

  public name: string;
  public absolutePath: string;
  public dir: string;
  public fileStorage: IFileStorage;
  public storageConnection: StorageConnection | undefined = undefined;
  public dialogIndexer: DialogIndexer;
  public botFile: FileInfo | any = null;

  constructor(ref: BotProjectRef) {
    this.ref = ref;

    this.storageConnection = this._getStorageConnection(this.ref.storageId);
    if (this.storageConnection === undefined) {
      throw new Error('no storage match');
    }
    this.fileStorage = StorageFactory.createStorageClient(this.storageConnection);
    this.dialogIndexer = new DialogIndexer(this.fileStorage);
    this.absolutePath = path.resolve(this.ref.path);
    this.dir = path.dirname(this.absolutePath);
    this.name = path.basename(this.absolutePath);
  }

  init = async () => {
    const files = await this._loadResource();
    const dialogs = this.dialogIndexer.index(files);
    this.botFile = files[0];
    return {
      dialogs: dialogs,
      botFile: this.botFile,
    };
  };

  private _getStorageConnection = (id: string): StorageConnection | undefined => {
    const storageConnections: StorageConnection[] = Store.get('storageConnections');
    return storageConnections.find(s => {
      return s.id === id;
    });
  };

  private _loadResource = async () => {
    const fileList: FileInfo[] = [];
    // get .bot file
    const botFileContent = await this.fileStorage.readFile(this.absolutePath);
    // get 'files' from .bot file
    const botConfig: BotProjectFileContent = JSON.parse(botFileContent);

    if (botConfig !== undefined && Array.isArray(botConfig.files)) {
      fileList.push({
        name: this.name,
        content: botConfig,
        path: this.absolutePath,
        relativePath: path.relative(this.dir, this.absolutePath),
      });

      for (const pattern of botConfig.files) {
        const paths = await glob(pattern, { cwd: this.dir });

        for (const filePath of paths.sort()) {
          const realFilePath: string = path.resolve(this.dir, filePath);
          // skip lg files for now
          if ((await this.fileStorage.stat(realFilePath)).isFile) {
            const content: string = await this.fileStorage.readFile(realFilePath);
            fileList.push({
              name: filePath,
              content: content,
              path: realFilePath,
              relativePath: path.relative(this.dir, realFilePath),
            });
          }
        }
      }
    }

    return fileList;
  };

  private _getFiles = async () => {
    const files = await this._loadResource();
    return files;
  };

  public getProject = async () => {
    const project = await this.init();
    return project;
  };

  public createDialogFromTemplate = async (name: string, types: string[]) => {
    const absolutePath: string = path.join(this.dir, `${name.trim()}.dialog`);
    const newDialog = merge({}, DIALOG_TEMPLATE);

    types.forEach((type: string, idx: number) => {
      set(newDialog, `rules[0].steps[${idx}].$type`, type.trim());
    });

    const dialogs = this.dialogIndexer.addDialog(absolutePath, name, newDialog);
    return dialogs;
  };

  public updateDialog = async (name: string, content: any) => {
    const dialogs = await this.dialogIndexer.updateDialogs(name, content);
    return dialogs;
  };

  public updateBotFile = async (name: string, content: any) => {
    await this.fileStorage.writeFile(this.botFile.path, JSON.stringify(content, null, 2) + '\n');
    const botFileContent = await this.fileStorage.readFile(this.botFile.path);
    this.botFile.content = JSON.parse(botFileContent);
    return this.botFile;
  };

  public copyFiles = async (prevFiles: FileInfo[]) => {
    if (!(await this.fileStorage.exists(this.dir))) {
      await this.fileStorage.mkDir(this.dir);
    }
    for (const index in prevFiles) {
      const file = prevFiles[index];
      const absolutePath = path.resolve(this.dir, file.relativePath);
      const content = index === '0' ? JSON.stringify(file.content, null, 2) + '\n' : file.content;
      await this.fileStorage.writeFile(absolutePath, content);
    }
  };

  public copyTo = async (projRef: BotProjectRef) => {
    const newBotProject = new BotProject(projRef);
    await newBotProject.copyFiles(await this._getFiles());
    return newBotProject;
  };
}
