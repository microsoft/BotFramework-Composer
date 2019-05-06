import { merge } from 'lodash';

import { Path } from '../../utility/path';
import StorageService from '../../services/storage';

import DIALOG_TEMPLATE from './../../store/dialogTemplate.json';
import { IFileStorage } from './../storage/interface';
import { BotProjectRef, FileInfo, BotProjectFileContent, LGTemplate } from './interface';
import { DialogIndexer } from './indexers/dialogIndexers';
import { LGIndexer } from './indexers/lgIndexer';

// TODO:
// 1. refactor this class to use on IFileStorage instead of operating on fs
// 2. refactor this layer, to operate on dialogs, not files
export class BotProject {
  public ref: BotProjectRef;

  public name: string;
  public absolutePath: string;
  public dir: string;
  public files: FileInfo[] = [];
  public fileStorage: IFileStorage;
  public dialogIndexer: DialogIndexer;
  public lgIndexer: LGIndexer;

  constructor(ref: BotProjectRef) {
    this.ref = ref;
    this.absolutePath = Path.resolve(this.ref.path); // make sure we swtich to posix style after here
    this.dir = Path.dirname(this.absolutePath);
    this.name = Path.basename(this.absolutePath);

    this.fileStorage = StorageService.getStorageClient(this.ref.storageId);
    this.dialogIndexer = new DialogIndexer(this.fileStorage);
    this.lgIndexer = new LGIndexer(this.fileStorage);
  }

  public index = async () => {
    this.files = await this._getFiles();
    this.dialogIndexer.index(this.files);
    this.lgIndexer.index(this.files);
  };

  public getIndexes = () => {
    return {
      dialogs: this.dialogIndexer.getDialogs(),
      lgFiles: this.lgIndexer.getLgFiles(),
      botFile: this.getBotFile(),
    };
  };

  public getBotFile = () => {
    return this.files[0];
  };

  public updateBotFile = async (name: string, content: any) => {
    const botFile = this.files[0];
    await this.fileStorage.writeFile(botFile.path, JSON.stringify(content, null, 2) + '\n');
    const botFileContent = await this.fileStorage.readFile(botFile.path);
    botFile.content = JSON.parse(botFileContent);
    this.files[0] = botFile;
    return botFile;
  };

  public updateDialog = async (name: string, content: any) => {
    await this.dialogIndexer.updateDialogs(name, content);
    this._updateFile(`${name.trim()}.dialog`, JSON.stringify(content, null, 2) + '\n');
    return this.dialogIndexer.getDialogs();
  };

  public createDialogFromTemplate = async (name: string) => {
    const absolutePath: string = Path.join(this.dir, `${name.trim()}.dialog`);
    const newDialog = merge({}, DIALOG_TEMPLATE);

    const newFileContent = await this._createFile(absolutePath, name, JSON.stringify(newDialog, null, 2) + '\n');
    this.dialogIndexer.addDialog(name, newFileContent, absolutePath);
    return this.dialogIndexer.getDialogs();
  };

  public updateLgFile = async (id: string, content: LGTemplate[]) => {
    const newFileContent = await this.lgIndexer.updateLgFile(id, content);
    this._updateFile(`${id.trim()}.lg`, newFileContent);
    return this.lgIndexer.getLgFiles();
  };

  public copyFiles = async (prevFiles: FileInfo[]) => {
    if (!(await this.fileStorage.exists(this.dir))) {
      await this.fileStorage.mkDir(this.dir);
    }
    for (const index in prevFiles) {
      const file = prevFiles[index];
      const absolutePath = Path.join(this.dir, file.relativePath);
      const content = index === '0' ? JSON.stringify(file.content, null, 2) + '\n' : file.content;
      await this.fileStorage.writeFile(absolutePath, content);
    }
  };

  public copyTo = async (projRef: BotProjectRef) => {
    const newBotProject = new BotProject(projRef);
    await newBotProject.copyFiles(await this._getFiles());
    return newBotProject;
  };

  private _createFile = async (absolutePath: string, name: string, content: string) => {
    await this.fileStorage.writeFile(absolutePath, content);
    const fileContent: string = await this.fileStorage.readFile(absolutePath);
    this.files.push({
      name: name,
      content: content,
      path: absolutePath,
      relativePath: Path.relative(this.dir, absolutePath),
    });
    return fileContent;
  };

  private _updateFile = async (name: string, content: string) => {
    const index = this.files.findIndex(file => {
      return file.name === name;
    });
    this.files[index].content = content;
  };

  private _getFiles = async () => {
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
        relativePath: Path.relative(this.dir, this.absolutePath),
      });

      for (const pattern of botConfig.files) {
        const paths = await this.fileStorage.glob(pattern, this.dir);

        for (const filePath of paths.sort()) {
          const realFilePath: string = Path.join(this.dir, filePath);
          // skip lg files for now
          if ((await this.fileStorage.stat(realFilePath)).isFile) {
            const content: string = await this.fileStorage.readFile(realFilePath);
            fileList.push({
              name: filePath,
              content: content,
              path: realFilePath,
              relativePath: Path.relative(this.dir, realFilePath),
            });
          }
        }
      }
    }

    return fileList;
  };
}
