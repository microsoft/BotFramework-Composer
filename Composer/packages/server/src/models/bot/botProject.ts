import { merge } from 'lodash';

import { Path } from '../../utility/path';
import StorageService from '../../services/storage';

import DIALOG_TEMPLATE from './../../store/dialogTemplate.json';
import { IFileStorage } from './../storage/interface';
import { LocationRef, FileInfo, BotProjectFileContent } from './interface';
import { DialogIndexer } from './indexers/dialogIndexers';
import { LGIndexer } from './indexers/lgIndexer';
import { LUIndexer } from './indexers/luIndexer';

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

  constructor(ref: LocationRef) {
    this.ref = ref;
    this.absolutePath = Path.resolve(this.ref.path); // make sure we swtich to posix style after here
    this.dir = Path.dirname(this.absolutePath);
    this.name = Path.basename(this.absolutePath);

    this.fileStorage = StorageService.getStorageClient(this.ref.storageId);
    this.dialogIndexer = new DialogIndexer();
    this.lgIndexer = new LGIndexer();
    this.luIndexer = new LUIndexer();
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

  public updateDialog = async (name: string, dialogContent: any) => {
    const dialog = this.dialogIndexer.getDialogs().find(d => d.name === name);
    if (dialog === undefined) {
      throw new Error(`no such dialog ${name}`);
    }

    const relativePath = dialog.relativePath;
    const content = JSON.stringify(dialogContent, null, 2) + '\n';
    await this._updateFile(relativePath, content);

    return this.dialogIndexer.getDialogs();
  };

  public createDialogFromTemplate = async (name: string, dir: string = '') => {
    const relativePath = Path.join(dir, `${name.trim()}.dialog`);
    const content = JSON.stringify(merge({}, DIALOG_TEMPLATE), null, 2) + '\n';

    await this._createFile(relativePath, content);
    return this.dialogIndexer.getDialogs();
  };

  public updateLgFile = async (id: string, content: string) => {
    const lgFile = this.lgIndexer.getLgFiles().find(lg => lg.id === id);
    if (lgFile === undefined) {
      throw new Error(`no such lg file ${id}`);
    }
    await this._updateFile(lgFile.relativePath, content);
    return this.lgIndexer.getLgFiles();
  };

  public createLgFile = async (id: string, content: string, dir: string = '') => {
    const relativePath = Path.join(dir, `${id.trim()}.lg`);
    await this._createFile(relativePath, content);
    return this.lgIndexer.getLgFiles();
  };

  public removeLgFile = async (id: string) => {
    const lgFile = this.lgIndexer.getLgFiles().find(lg => lg.id === id);
    if (lgFile === undefined) {
      throw new Error(`no such lg file ${id}`);
    }
    await this._removeFile(lgFile.relativePath);
    return this.lgIndexer.getLgFiles();
  };

  public updateLuFile = async (id: string, content: string) => {
    const luFile = this.luIndexer.getLuFiles().find(lu => lu.id === id);
    if (luFile === undefined) {
      throw new Error(`no such lu file ${id}`);
    }
    await this._updateFile(luFile.relativePath, content);
    return this.luIndexer.getLuFiles();
  };

  public createLuFile = async (id: string, content: string, dir: string = '') => {
    const relativePath = Path.join(dir, `${id.trim()}.lu`);
    await this._createFile(relativePath, content);
    return this.luIndexer.getLuFiles();
  };

  public removeLuFile = async (id: string) => {
    const luFile = this.luIndexer.getLuFiles().find(lu => lu.id === id);
    if (luFile === undefined) {
      throw new Error(`no such lu file ${id}`);
    }
    this._removeFile(luFile.relativePath);
    return this.luIndexer.getLuFiles();
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

  // create file in this project
  // this function will gurantee the memory cache (this.files, all indexes) also gets updated
  private _createFile = async (relativePath: string, content: string) => {
    const absolutePath = `${this.dir}/${relativePath}`;
    await this.ensureDirExists(Path.dirname(relativePath));
    await this.fileStorage.writeFile(absolutePath, content);

    // update this.files which is memory cache of all files
    this.files.push({
      name: Path.basename(relativePath),
      content: content,
      path: absolutePath,
      relativePath: relativePath,
    });

    this.reindex(relativePath);
  };

  // update file in this project
  // this function will gurantee the memory cache (this.files, all indexes) also gets updated
  private _updateFile = async (relativePath: string, content: string) => {
    const absolutePath = `${this.dir}/${relativePath}`;
    await this.fileStorage.writeFile(absolutePath, content);

    const index = this.files.findIndex(f => f.relativePath === relativePath);
    if (index === -1) {
      throw new Error(`no such file at ${relativePath}`);
    }

    this.files[index].content = content;
    this.reindex(relativePath);
  };

  // remove file in this project
  // this function will gurantee the memory cache (this.files, all indexes) also gets updated
  private _removeFile = async (relativePath: string) => {
    const absolutePath = `${this.dir}/${relativePath}`;
    await this.fileStorage.removeFile(absolutePath);

    const index = this.files.findIndex(f => f.relativePath === relativePath);
    if (index === -1) {
      throw new Error(`no such file at ${relativePath}`);
    }

    this.files.splice(index, 1);
    this.reindex(relativePath);
  };

  // re index according to file change in a certain path
  private reindex = (filePath: string) => {
    const fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
    // only call the specific indexer to re-index
    switch (fileExtension) {
      case 'dialog':
        this.dialogIndexer.index(this.files);
        break;
      case 'lg':
        this.lgIndexer.index(this.files);
        break;
      case 'lu':
        this.luIndexer.index(this.files);
        break;
      default:
        throw new Error(`${filePath} is not dialog or lg or lu file`);
    }
  };

  // ensure dir exist, dir is a relative dir path to root
  private ensureDirExists = async (dir: string) => {
    if (dir === '' || dir === '.' || !dir) {
      return;
    }
    const parts = dir.split('/');
    // intermidate paths down to the eventual dir
    const paths = parts.map((_, idx) => {
      return Path.join(this.dir, ...parts.slice(0, idx + 1));
    });

    for (const p of paths) {
      const exist = await this.fileStorage.exists(p);
      if (!exist) {
        await this.fileStorage.mkDir(p);
      }
    }
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
