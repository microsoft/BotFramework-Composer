import { merge } from 'lodash';

import { Path } from '../../utility/path';
import StorageService from '../../services/storage';

import DIALOG_TEMPLATE from './../../store/dialogTemplate.json';
import { IFileStorage } from './../storage/interface';
import { LocationRef, FileInfo, BotProjectFileContent } from './interface';
import { DialogIndexer } from './indexers/dialogIndexers';
import { LGIndexer } from './indexers/lgIndexer';
import { LUIndexer } from './indexers/luIndexer';
import { LuPublisher } from './luPublisher';

// TODO:
// 1. refactor this class to use on IFileStorage instead of operating on fs
// 2. refactor this layer, to operate on dialogs, not files
export class BotProject {
  public ref: LocationRef;

  public name: string;
  public absolutePath: string;
  public dir: string;
  public files: FileInfo[] = [];
  public fileStorage: IFileStorage;
  public dialogIndexer: DialogIndexer;
  public lgIndexer: LGIndexer;
  public luIndexer: LUIndexer;
  public luPublisher: LuPublisher;
  constructor(ref: LocationRef) {
    this.ref = ref;
    this.absolutePath = Path.resolve(this.ref.path); // make sure we swtich to posix style after here
    this.dir = Path.dirname(this.absolutePath);
    this.name = Path.basename(this.absolutePath);

    this.fileStorage = StorageService.getStorageClient(this.ref.storageId);
    this.dialogIndexer = new DialogIndexer(this.fileStorage, this.dir);
    this.lgIndexer = new LGIndexer(this.fileStorage, this.dir);
    this.luPublisher = new LuPublisher(this.dir, this.fileStorage);
    this.luIndexer = new LUIndexer(this.fileStorage, this.dir);
  }

  public index = async () => {
    this.files = await this._getFiles();
    this.dialogIndexer.index(this.files);
    this.lgIndexer.index(this.files);
    this.luIndexer.index(this.files);
  };

  public getIndexes = () => {
    return {
      dialogs: this.dialogIndexer.getDialogs(),
      lgFiles: this.lgIndexer.getLgFiles(),
      luFiles: this.luIndexer.getLuFiles(),
      botFile: this.getBotFile(),
      schemas: this.getSchemas(),
    };
  };

  public getBotFile = () => {
    return this.files[0];
  };

  public getSchemas = () => {
    return {
      editor: this.files[1] && this.files[1].name === 'editorSchema' ? this.files[1] : undefined,
    };
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
    const relativePath = `${name.trim()}.dialog`;
    const absolutePath: string = Path.join(this.dir, relativePath);
    const newDialog = merge({}, DIALOG_TEMPLATE);

    const newFileContent = await this._createFile(absolutePath, name, JSON.stringify(newDialog, null, 2) + '\n');
    this.dialogIndexer.addDialog(name, newFileContent, relativePath);
    return this.dialogIndexer.getDialogs();
  };

  public updateLgFile = async (id: string, content: string) => {
    const newFileContent = await this.lgIndexer.updateLgFile(id, content);
    this._updateFile(`${id.trim()}.lg`, newFileContent);
    return this.lgIndexer.getLgFiles();
  };

  public createLgFile = async (id: string, content: string) => {
    const relativePath = `${id.trim()}.lg`;
    const absolutePath: string = Path.join(this.dir, relativePath);
    const newFileContent = await this._createFile(absolutePath, `${id}.lg`, content || '');
    this.lgIndexer.createLgFile(id, newFileContent, relativePath);

    return this.lgIndexer.getLgFiles();
  };

  public removeLgFile = async (id: string) => {
    await this._removeFile(`${id.trim()}.lg`);
    this.lgIndexer.removeLgFile(id);
    return this.lgIndexer.getLgFiles();
  };

  public updateLuFile = async (id: string, content: string) => {
    const newFileContent = await this.luIndexer.updateLuFile(id, content);
    const index = this._updateFile(`${id.trim()}.lu`, newFileContent);
    await this.luPublisher.update(this.files[index].path);
    return this.luIndexer.getLuFiles();
  };

  public createLuFile = async (id: string, content: string) => {
    const relativePath = `${id.trim()}.lu`;
    const absolutePath: string = Path.join(this.dir, relativePath);
    const newFileContent = await this._createFile(absolutePath, `${id}.lu`, content || '');
    this.luIndexer.createLuFile(id, newFileContent, relativePath);
    await this.luPublisher.add(absolutePath);
    return this.luIndexer.getLuFiles();
  };

  public removeLuFile = async (id: string) => {
    const relativePath = `${id.trim()}.lu`;
    const absolutePath: string = Path.join(this.dir, relativePath);
    await this._removeFile(relativePath);
    this.luIndexer.removeLuFile(id);
    await this.luPublisher.remove(absolutePath);
    return this.luIndexer.getLuFiles();
  };

  public publishLuis = async (authoringKey: string) => {
    return await this.luPublisher.publish(authoringKey);
  };

  public copyFiles = async (prevFiles: FileInfo[]) => {
    if (!(await this.fileStorage.exists(this.dir))) {
      await this.fileStorage.mkDir(this.dir);
    }
    for (const index in prevFiles) {
      const file = prevFiles[index];
      const absolutePath = Path.join(this.dir, file.relativePath);
      const content =
        index === '0' || file.name === 'editorSchema' ? JSON.stringify(file.content, null, 2) + '\n' : file.content;
      await this.fileStorage.writeFile(absolutePath, content);
    }
  };

  public copyTo = async (locationRef: LocationRef) => {
    const newBotProject = new BotProject(locationRef);
    await newBotProject.copyFiles(await this._getFiles());
    return newBotProject;
  };

  public exists() {
    return this.fileStorage.exists(this.absolutePath);
  }

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

  private _removeFile = async (name: string) => {
    const targetFile = this.files.find(file => {
      return file.name === name;
    });
    if (targetFile) {
      const absolutePath = targetFile.path;
      await this.fileStorage.removeFile(absolutePath);
    }
  };

  private _updateFile = (name: string, content: string) => {
    const index = this.files.findIndex(file => {
      return file.name === name;
    });
    this.files[index].content = content;
    return index;
  };

  private _getFiles = async () => {
    const fileList: FileInfo[] = [];
    // get .bot file
    const botFileContent = await this.fileStorage.readFile(this.absolutePath);
    // get 'files' from .bot file
    const botConfig: BotProjectFileContent = JSON.parse(botFileContent);

    if (botConfig !== undefined) {
      fileList.push({
        name: this.name,
        content: botConfig,
        path: this.absolutePath,
        relativePath: Path.relative(this.dir, this.absolutePath),
      });

      if (botConfig.schemas) {
        if (botConfig.schemas.editor) {
          const editorSchemaFile = await this.fileStorage.readFile(`${this.dir}/${botConfig.schemas.editor}`);
          try {
            const editorSchema = JSON.parse(editorSchemaFile);
            fileList.push({
              name: 'editorSchema',
              content: editorSchema,
              path: `${this.dir}/${botConfig.schemas.editor}`,
              relativePath: botConfig.schemas.editor,
            });
          } catch {
            throw new Error('Attempt to parse editor schema as JSON failed');
          }
        }
      }

      const patterns = ['**/*.dialog', '**/*.lg', '**/*.lu'];

      for (const pattern of patterns) {
        const paths = await this.fileStorage.glob(pattern, this.dir);

        for (const filePath of paths.sort()) {
          const realFilePath: string = Path.join(this.dir, filePath);
          // skip lg files for now
          if ((await this.fileStorage.stat(realFilePath)).isFile) {
            const content: string = await this.fileStorage.readFile(realFilePath);
            fileList.push({
              name: Path.basename(filePath),
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
