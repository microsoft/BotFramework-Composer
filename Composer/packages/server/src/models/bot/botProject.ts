import { merge } from 'lodash';

import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';

import DIALOG_TEMPLATE from './../../store/dialogTemplate.json';
import { IFileStorage } from './../storage/interface';
import { LocationRef, FileInfo, BotProjectFileContent, LGFile, Dialog, LUFile, ILuisConfig } from './interface';
import { DialogIndexer } from './indexers/dialogIndexers';
import { LGIndexer } from './indexers/lgIndexer';
import { LUIndexer } from './indexers/luIndexer';
import { LuPublisher } from './luPublisher';

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
    this.name = Path.basename(this.dir);

    this.fileStorage = StorageService.getStorageClient(this.ref.storageId);

    this.dialogIndexer = new DialogIndexer();
    this.lgIndexer = new LGIndexer();
    this.luIndexer = new LUIndexer();
    this.luPublisher = new LuPublisher(this.dir, this.fileStorage);
  }

  public index = async () => {
    this.files = await this._getFiles();
    this.dialogIndexer.index(this.files);
    this.lgIndexer.index(this.files);
    await this.luIndexer.index(this.files); // ludown parser is async
    await this.luPublisher.getLuisStatus();
    await this._checkProjectStructure();
  };

  public getIndexes = () => {
    return {
      botName: this.name,
      dialogs: this.dialogIndexer.getDialogs(),
      lgFiles: this.lgIndexer.getLgFiles(),
      luFiles: this.luIndexer.getLuFiles(),
      botFile: this.getBotFile(),
      schemas: this.getSchemas(),
      luStatus: this.luPublisher.status,
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

  public updateDialog = async (id: string, dialogContent: any): Promise<Dialog[]> => {
    // TODO: replace name with id with dialog in next pass, to make in consistent across dialog, lg, lu
    const dialog = this.dialogIndexer.getDialogs().find(d => d.name === id);
    if (dialog === undefined) {
      throw new Error(`no such dialog ${name}`);
    }

    const relativePath = dialog.relativePath;
    const content = JSON.stringify(dialogContent, null, 2) + '\n';
    await this._updateFile(relativePath, content);

    return this.dialogIndexer.getDialogs();
  };

  public createDialog = async (id: string, dir: string = ''): Promise<Dialog[]> => {
    const relativePath = Path.join(dir, `${id.trim()}.dialog`);
    const content = JSON.stringify(merge({}, DIALOG_TEMPLATE), null, 2) + '\n';

    await this._createFile(relativePath, content);
    return this.dialogIndexer.getDialogs();
  };

  public updateLgFile = async (id: string, content: string): Promise<LGFile[]> => {
    const lgFile = this.lgIndexer.getLgFiles().find(lg => lg.id === id);
    if (lgFile === undefined) {
      throw new Error(`no such lg file ${id}`);
    }
    await this._updateFile(lgFile.relativePath, content);
    return this.lgIndexer.getLgFiles();
  };

  public createLgFile = async (id: string, content: string, dir: string = ''): Promise<LGFile[]> => {
    const relativePath = Path.join(dir, `${id.trim()}.lg`);
    await this._createFile(relativePath, content);
    return this.lgIndexer.getLgFiles();
  };

  public removeLgFile = async (id: string): Promise<LGFile[]> => {
    const lgFile = this.lgIndexer.getLgFiles().find(lg => lg.id === id);
    if (lgFile === undefined) {
      throw new Error(`no such lg file ${id}`);
    }
    await this._removeFile(lgFile.relativePath);
    return this.lgIndexer.getLgFiles();
  };

  public updateLuFile = async (id: string, content: string): Promise<LUFile[]> => {
    const luFile = this.luIndexer.getLuFiles().find(lu => lu.id === id);
    if (luFile === undefined) {
      throw new Error(`no such lu file ${id}`);
    }
    await this._updateFile(luFile.relativePath, content);
    this.luPublisher.update(luFile.relativePath);
    return this.luIndexer.getLuFiles();
  };

  public createLuFile = async (id: string, content: string, dir: string = ''): Promise<LUFile[]> => {
    const relativePath = Path.join(dir, `${id.trim()}.lu`);
    await this._createFile(relativePath, content);
    return this.luIndexer.getLuFiles();
  };

  public removeLuFile = async (id: string): Promise<LUFile[]> => {
    const luFile = this.luIndexer.getLuFiles().find(lu => lu.id === id);
    if (luFile === undefined) {
      throw new Error(`no such lu file ${id}`);
    }
    this._removeFile(luFile.relativePath);
    return this.luIndexer.getLuFiles();
  };

  public publishLuis = async (config: ILuisConfig) => {
    return await this.luPublisher.publish(config, this.luIndexer.getLuFiles().filter(f => !!f.content.trim()));
  };

  public checkNeedLuisDeploy = async () => {
    if (this.luIndexer.getLuFiles().filter(f => !!f.content).length <= 0) {
      return false;
    } else {
      return !(await this.luPublisher.checkLuisDeployed());
    }
  };

  public cloneFiles = async (locationRef: LocationRef): Promise<LocationRef> => {
    // get destination storage client
    const dstStorage = StorageService.getStorageClient(locationRef.storageId);
    // ensure saveAs path isn't existed in dst storage, in order to cover or mess up existed bot proj
    if (await dstStorage.exists(locationRef.path)) {
      throw new Error('already have this folder, please give another name');
    }
    const dstDir = locationRef.path;
    await dstStorage.mkDir(dstDir, { recursive: true });

    await copyDir(this.dir, this.fileStorage, dstDir, dstStorage);

    // return new proj ref
    const dstBotProj = await dstStorage.glob('**/*.botproj', locationRef.path);
    if (dstBotProj && dstBotProj.length === 1) {
      return {
        storageId: locationRef.storageId,
        path: Path.join(locationRef.path, dstBotProj[0]),
      };
    } else if (dstBotProj && dstBotProj.length > 1) {
      throw new Error('new bot porject have more than one botproj file');
    } else {
      throw new Error('new bot porject have no botproj file');
    }
  };

  public copyTo = async (locationRef: LocationRef) => {
    const newProjRef = await this.cloneFiles(locationRef);
    return new BotProject(newProjRef);
  };

  public exists(): Promise<boolean> {
    return this.fileStorage.exists(this.absolutePath);
  }

  // create file in this project
  // this function will gurantee the memory cache (this.files, all indexes) also gets updated
  private _createFile = async (relativePath: string, content: string) => {
    const absolutePath = Path.resolve(this.dir, relativePath);
    await this.ensureDirExists(Path.dirname(absolutePath));
    await this.fileStorage.writeFile(absolutePath, content);

    // update this.files which is memory cache of all files
    this.files.push({
      name: Path.basename(relativePath),
      content: content,
      path: absolutePath,
      relativePath: relativePath,
    });

    await this.reindex(relativePath);
  };

  // update file in this project
  // this function will gurantee the memory cache (this.files, all indexes) also gets updated
  private _updateFile = async (relativePath: string, content: string) => {
    const index = this.files.findIndex(f => f.relativePath === relativePath);
    if (index === -1) {
      throw new Error(`no such file at ${relativePath}`);
    }

    const absolutePath = `${this.dir}/${relativePath}`;
    await this.fileStorage.writeFile(absolutePath, content);

    this.files[index].content = content;
    await this.reindex(relativePath);
  };

  // remove file in this project
  // this function will gurantee the memory cache (this.files, all indexes) also gets updated
  private _removeFile = async (relativePath: string) => {
    const index = this.files.findIndex(f => f.relativePath === relativePath);
    if (index === -1) {
      throw new Error(`no such file at ${relativePath}`);
    }

    const absolutePath = `${this.dir}/${relativePath}`;
    await this.fileStorage.removeFile(absolutePath);

    this.files.splice(index, 1);
    await this.reindex(relativePath);
  };

  // re index according to file change in a certain path
  private reindex = async (filePath: string) => {
    const fileExtension = Path.extname(filePath);
    // only call the specific indexer to re-index
    switch (fileExtension) {
      case '.dialog':
        this.dialogIndexer.index(this.files);
        break;
      case '.lg':
        this.lgIndexer.index(this.files);
        break;
      case '.lu':
        await this.luIndexer.index(this.files); // ludown parser is async
        break;
      default:
        throw new Error(`${filePath} is not dialog or lg or lu file`);
    }
  };

  // ensure dir exist, dir is a absolute dir path
  private ensureDirExists = async (dir: string) => {
    if (!dir || dir === '.') {
      return;
    }
    if (!(await this.fileStorage.exists(dir))) {
      await this.fileStorage.mkDir(dir, { recursive: true });
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
        name: Path.basename(this.absolutePath),
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

  // check project stracture is valid or not, if not, try fix it.
  private _checkProjectStructure = async () => {
    const dialogs: Dialog[] = this.dialogIndexer.getDialogs();
    const luFiles: LUFile[] = this.luIndexer.getLuFiles();
    // ensure each dialog got a lu file
    for (const dialog of dialogs) {
      // dialog/lu should in the same path folder
      const targetLuFilePath = `${Path.basename(dialog.relativePath)}.lu`;
      const exist = luFiles.findIndex((luFile: { [key: string]: any }) => luFile.relativePath === targetLuFilePath);
      if (exist === -1) {
        await this._createFile(targetLuFilePath, '');
      }
    }
  };
}
