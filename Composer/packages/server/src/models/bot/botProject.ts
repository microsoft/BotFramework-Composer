import fs from 'fs';

import { isEqual } from 'lodash';

import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';
import { absHosted } from '../../settings/env';
import {
  Resource,
  FileResource,
  DialogResource,
  LGResource,
  LUResource,
  ResourceType,
  SchemaResource,
  ResourceResolver,
} from '../resource';
import { ResourceValidator, DeclartiveValidator } from '../validator';

import { IFileStorage } from './../storage/interface';
import { LocationRef, LuisStatus, FileUpdateType } from './interface';
import { LuPublisher } from './luPublisher';
import { SettingManager } from './settingManager';
import { DialogSetting } from './interface';

const oauthInput = () => ({
  MicrosoftAppId: process.env.MicrosoftAppId || '',
  MicrosoftAppPassword: process.env.MicrosoftAppPassword || '',
});

export class BotProject implements ResourceResolver {
  public ref: LocationRef;

  public name: string;
  public dir: string;

  public resources: Resource[] = [];
  public validator: ResourceValidator;

  public fileStorage: IFileStorage;

  public luPublisher: LuPublisher;
  public defaultSDKSchema: { [key: string]: string };
  public defaultEditorSchema: { [key: string]: string };
  public settingManager: SettingManager;
  public settings: DialogSetting | null = null;
  constructor(ref: LocationRef) {
    this.ref = ref;
    this.dir = Path.resolve(this.ref.path); // make sure we swtich to posix style after here
    this.name = Path.basename(this.dir);

    this.defaultSDKSchema = JSON.parse(fs.readFileSync(Path.join(__dirname, '../../../schemas/sdk.schema'), 'utf-8'));
    this.defaultEditorSchema = JSON.parse(
      fs.readFileSync(Path.join(__dirname, '../../../schemas/editor.schema'), 'utf-8')
    );
    this.settingManager = new SettingManager(this.dir);
    this.fileStorage = StorageService.getStorageClient(this.ref.storageId);

    this.luPublisher = new LuPublisher(this.dir, this.fileStorage);
    this.validator = new DeclartiveValidator();
  }

  public loadResources = async (dir: string): Promise<Resource[]> => {
    if (!(await this.exists())) {
      throw new Error(`${dir} is not a valid path`);
    }

    const resources: Resource[] = [];
    const patterns = ['**/*.dialog', '**/*.lg', '**/*.lu', '**/*.schema'];
    for (const pattern of patterns) {
      const paths = (await this.fileStorage.glob(pattern, dir)).map(x => Path.join(dir, x));

      for (const path of paths.sort()) {
        if (path.endsWith('.lu.dialog')) {
          continue;
        }
        if ((await this.fileStorage.stat(path)).isFile) {
          const resource = await this.loadResource(path);
          if (resource !== null) {
            resources.push(resource);
          }
        }
      }
    }

    return resources;
  };

  public loadResource = async (path: string): Promise<Resource | null> => {
    const extname: string = Path.extname(path);
    const id: string = Path.basename(path, extname);

    const content: string = await this.fileStorage.readFile(path);
    const relativePath: string = Path.relative(this.dir, path);

    let resource: Resource | null = null;

    switch (extname) {
      case '.dialog':
        resource = new DialogResource(id, content, relativePath);
        break;
      case '.lg':
        resource = new LGResource(id, content, relativePath);
        break;
      case '.lu':
        resource = new LUResource(id, content, relativePath);
        break;
      case '.schema':
        resource = new SchemaResource(id, content, relativePath);
      default:
        throw new Error(
          `Unrecnogizned format of resource file, expected: .dialog .lg or .lu or .schema, actual ${path} `
        );
    }

    if (resource !== null) {
      try {
        await resource.index(this.name);
      } catch (err) {
        // index is just a best-effort, validator will report more detailed issues
      }
      return resource;
    }

    return null;
  };

  public getResource = (id: string, type: ResourceType): Resource => {
    const result = this.resources.filter(this.isSameResource(id, type));

    if (result.length === 0) {
      throw new Error(`No such resource, id: ${id}, type: ${type}`);
    }

    return result[0];
  };

  public isDialog = (r: Resource) => r.type === ResourceType.DIALOG;
  public isLG = (r: Resource) => r.type === ResourceType.LG;
  public isLU = (r: Resource) => r.type === ResourceType.LU;
  public isSchema = (r: Resource) => r.type === ResourceType.SCHEMA;
  public isSameResource = (id: string, type: ResourceType) => (r: Resource) => r.id === id && r.type === type;

  public updateResource = async (id: string, type: ResourceType, content: string): Promise<Resource> => {
    const index = this.resources.findIndex(this.isSameResource(id, type));
    if (index < 0) {
      throw new Error(`No such resource, id: ${id}, type: ${type}`);
    }

    const resource = this.resources[index] as FileResource;
    await this._updateFile(resource.relativePath, content);
    const newResource = await this.loadResource(Path.join(this.dir, resource.relativePath));
    if (newResource === null) {
      throw new Error(`Unable to reload resource, id: ${id}, type: ${type}`);
    }
    this.resources[index] = newResource;
    await this.validateResources();
    return newResource;
  };

  public createResource = async (
    id: string,
    type: ResourceType,
    content: string,
    relativePath: string
  ): Promise<Resource> => {
    const index = this.resources.findIndex(this.isSameResource(id, type));

    if (index >= 0) {
      throw new Error(`Can't add resource with the same id and type, id: ${id}, type: ${type}`);
    }

    await this._createFile(relativePath, content);

    const newResource = await this.loadResource(Path.join(this.dir, relativePath));
    if (newResource === null) {
      throw new Error(`Unable to reload resource, id: ${id}, type: ${type}`);
    }
    this.resources.push(newResource);

    await this.validateResources();
    return newResource;
  };

  public removeResource = async (id: string, type: ResourceType) => {
    const index = this.resources.findIndex(this.isSameResource(id, type));

    if (index < 0) {
      throw new Error(`No such resource, id: ${id}, type: ${type}`);
    }

    const resource = this.resources[index] as FileResource;
    await this._removeFile(resource.relativePath);
    this.resources.splice(index, 1);
    await this.validateResources();
  };

  // We now do a full validation each time resources are updated
  // we might do smarter re-validaton in the furture
  public validateResources = async () => {
    this.resources.forEach(r => {
      r.diagnostics = this.validator.validate(r, this);
    });
  };

  public resolve(srcResource: Resource, reference: string): Resource {
    // default to source resource type, incase we can't judge type from reference
    let resourceType = srcResource.type;
    const extname = Path.extname(reference);

    const typeMap: { [key: string]: ResourceType } = {
      '.dialog': ResourceType.DIALOG,
      '.lg': ResourceType.LG,
      '.lu': ResourceType.LU,
      '.schema': ResourceType.SCHEMA,
    };

    if (extname in typeMap) {
      resourceType = typeMap[extname];
    }

    const id = Path.basename(reference, extname);

    const matches = this.resources.filter(this.isSameResource(id, resourceType));
    if (matches.length == 0) {
      throw new Error(`Can't resolve such a reference: ${reference}, no such resource`);
    }
    return matches[0];
  }

  public index = async () => {
    this.resources = await this.loadResources(this.dir);
    await this.validateResources();

    this.settings = await this.getDialogSetting();

    if (this.settings) {
      await this.luPublisher.setLuisConfig(this.settings.luis);
    }

    const luResources = this.resources.filter(this.isLU) as LUResource[];
    await this.luPublisher.loadStatus(luResources.map(f => f.relativePath));
  };

  public getIndexes = () => {
    return {
      botName: this.name,
      dialogs: this.resources.filter(this.isDialog),
      lgFiles: this.resources.filter(this.isLG),
      luFiles: this.mergeLuStatus(this.resources.filter(this.isLU) as LUResource[], this.luPublisher.status),
      schemas: this.getSchemas(),
      botEnvironment: absHosted ? this.name : undefined,
      settings: this.settings,
    };
  };

  private getDialogSetting = async () => {
    const settings = await this.settingManager.get();
    if (settings && oauthInput().MicrosoftAppId !== '') {
      settings.MicrosoftAppId = oauthInput().MicrosoftAppId;
    }
    if (settings && oauthInput().MicrosoftAppPassword !== '') {
      settings.MicrosoftAppPassword = oauthInput().MicrosoftAppPassword;
    }
    return settings;
  };

  // create or update dialog settings
  public updateEnvSettings = async (config: DialogSetting) => {
    await this.settingManager.set(config);
    await this.luPublisher.setLuisConfig(config.luis);
  };

  // merge the status managed by luPublisher to the LuFile structure to keep a unified interface
  private mergeLuStatus = (luFiles: LUResource[], luStatus: { [key: string]: LuisStatus }) => {
    return luFiles.map(x => {
      if (!luStatus[x.relativePath]) {
        throw new Error(`No luis status for lu file ${x.relativePath} `);
      }
      return {
        ...x,
        status: luStatus[x.relativePath],
      };
    });
  };

  public getSchemas = () => {
    let editorSchema = this.defaultEditorSchema;
    let sdkSchema = this.defaultSDKSchema;
    const diagnostics: string[] = [];

    const userSchemas = this.resources.filter(this.isSchema) as SchemaResource[];

    const userEditorSchemaFile = userSchemas.find(r => r.id === 'editor');
    const userSDKSchemaFile = userSchemas.find(r => r.id === 'sdk');

    if (userEditorSchemaFile !== undefined) {
      try {
        editorSchema = JSON.parse(userEditorSchemaFile.content);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Attempt to parse editor schema as JSON failed');
        diagnostics.push(`Error in editor.schema, ${error.message} `);
      }
    }

    if (userSDKSchemaFile !== undefined) {
      try {
        sdkSchema = JSON.parse(userSDKSchemaFile.content);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Attempt to parse sdk schema as JSON failed');
        diagnostics.push(`Error in sdk.schema, ${error.message} `);
      }
    }

    return {
      editor: { content: editorSchema },
      sdk: { content: sdkSchema },
      diagnostics,
    };
  };

  public updateBotInfo = async (name: string, description: string) => {
    const mainDialog = this.resources.find(this.isSameResource('Main', ResourceType.DIALOG));
    if (mainDialog !== undefined) {
      mainDialog.content.$designer = {
        ...mainDialog.content.$designer,
        name,
        description,
      };
      await this.updateDialog('Main', mainDialog.content);
    }
  };

  public updateDialog = async (id: string, dialogContent: any): Promise<Resource[]> => {
    const content = JSON.stringify(dialogContent, null, 2) + '\n';
    await this.updateResource(id, ResourceType.DIALOG, content);
    return this.resources.filter(this.isDialog);
  };

  public createDialog = async (id: string, content: string = '', dir: string = ''): Promise<Resource[]> => {
    const relativePath = Path.join(dir, `${id.trim()}.dialog`);
    await this.createResource(id, ResourceType.DIALOG, content, relativePath);
    return this.resources.filter(this.isDialog);
  };

  public removeDialog = async (id: string): Promise<Resource[]> => {
    await this.removeResource(id, ResourceType.DIALOG);
    return this.resources.filter(this.isDialog);
  };

  public updateLgFile = async (id: string, content: string): Promise<Resource[]> => {
    await this.updateResource(id, ResourceType.LG, content);
    return this.resources.filter(this.isLG);
  };

  public createLgFile = async (id: string, content: string, dir: string = ''): Promise<Resource[]> => {
    const relativePath = Path.join(dir, `${id.trim()}.lg`);
    await this.createResource(id, ResourceType.LG, content, relativePath);
    return this.resources.filter(this.isLG);
  };

  public removeLgFile = async (id: string): Promise<Resource[]> => {
    await this.removeResource(id, ResourceType.LG);
    return this.resources.filter(this.isLG);
  };

  public updateLuFile = async (id: string, content: string): Promise<Resource[]> => {
    const previousParsedContent = (this.getResource(id, ResourceType.LU) as LUResource).parsedContent;
    const currentResource = (await this.updateResource(id, ResourceType.LU, content)) as LUResource;
    const currentParsedContent = currentResource.parsedContent;

    const isUpdated = !isEqual(previousParsedContent, currentParsedContent);

    if (isUpdated) {
      await this.luPublisher.onFileChange(currentResource.relativePath, FileUpdateType.UPDATE);
    }
    return this.mergeLuStatus(this.resources.filter(this.isLU) as LUResource[], this.luPublisher.status);
  };

  public createLuFile = async (id: string, content: string, dir: string = ''): Promise<Resource[]> => {
    const relativePath = Path.join(dir, `${id.trim()}.lu`);
    await this.createResource(id, ResourceType.LU, content, relativePath);
    await this.luPublisher.onFileChange(relativePath, FileUpdateType.CREATE); // let publisher know that some files changed
    return this.mergeLuStatus(this.resources.filter(this.isLU) as LUResource[], this.luPublisher.status);
  };

  public removeLuFile = async (id: string): Promise<Resource[]> => {
    const resource = this.getResource(id, ResourceType.LU) as FileResource;
    await this.removeResource(id, ResourceType.LU);
    await this.luPublisher.onFileChange(resource.relativePath, FileUpdateType.DELETE);
    return this.mergeLuStatus(this.resources.filter(this.isLU) as LUResource[], this.luPublisher.status);
  };

  public publishLuis = async (authoringKey: string) => {
    await this.luPublisher.setAuthoringKey(authoringKey);

    const referred = this.resources.filter(this.isLU).filter(this.isLuReferred) as LUResource[];
    const unpublished = referred.filter(r => this.luPublisher.isUnPublished(r.relativePath));

    const invalidLuFile = unpublished.filter(file => file.diagnostics.length !== 0);
    if (invalidLuFile.length !== 0) {
      const msg = this.generateErrorMessage(invalidLuFile);
      throw new Error(`The Following LuFile(s) are invalid: \n` + msg);
    }
    const emptyLuFiles = unpublished.filter(this.isEmpty);
    if (emptyLuFiles.length !== 0) {
      const msg = emptyLuFiles.map(file => file.id).join(' ');
      throw new Error(`You have the following empty LuFile(s): ` + msg);
    }

    try {
      if (unpublished.length > 0) {
        await this.luPublisher.publish(unpublished.map(x => x.relativePath));
      }
    } catch (error) {
      throw error;
    }
    return this.mergeLuStatus(this.resources.filter(this.isLU) as LUResource[], this.luPublisher.status);
  };

  public checkLuisPublished = async () => {
    const referred = this.resources.filter(this.isLU).filter(this.isLuReferred) as LUResource[];
    const unpublished = referred.filter(r => this.luPublisher.isUnPublished(r.relativePath));
    return unpublished.length <= 0;
  };

  public cloneFiles = async (locationRef: LocationRef): Promise<LocationRef> => {
    // get destination storage client
    const dstStorage = StorageService.getStorageClient(locationRef.storageId);
    // ensure saveAs path isn't existed in dst storage, in order to cover or mess up
    // existed bot proj
    if (await dstStorage.exists(locationRef.path)) {
      throw new Error('already have this folder, please give another name');
    }
    const dstDir = locationRef.path;
    await dstStorage.mkDir(dstDir, { recursive: true });

    await copyDir(this.dir, this.fileStorage, dstDir, dstStorage);

    return locationRef;
  };

  public copyTo = async (locationRef: LocationRef) => {
    const newProjRef = await this.cloneFiles(locationRef);
    return new BotProject(newProjRef);
  };

  public async exists(): Promise<boolean> {
    return (await this.fileStorage.exists(this.dir)) && (await this.fileStorage.stat(this.dir)).isDir;
  }

  private _createFile = async (relativePath: string, content: string) => {
    const absolutePath = Path.resolve(this.dir, relativePath);
    await this.ensureDirExists(Path.dirname(absolutePath));
    await this.fileStorage.writeFile(absolutePath, content);
  };

  private _updateFile = async (relativePath: string, content: string) => {
    const absolutePath = `${this.dir}/${relativePath}`;
    await this.fileStorage.writeFile(absolutePath, content);
  };

  private _removeFile = async (relativePath: string) => {
    const absolutePath = `${this.dir}/${relativePath}`;
    await this.fileStorage.removeFile(absolutePath);
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

  private isEmpty = (LUFile: LUResource) => {
    if (LUFile === undefined) return true;
    if (LUFile.content === undefined || LUFile.content === '') return true;
    if (LUFile.parsedContent === undefined) return true;
    if (LUFile.parsedContent.LUISJsonStructure === undefined) return true;
    for (const key in LUFile.parsedContent.LUISJsonStructure) {
      if (LUFile.parsedContent.LUISJsonStructure[key].length !== 0) {
        return false;
      }
    }
    return true;
  };

  private isLuReferred = (r: Resource) => {
    const lu = r as LUResource;
    const index = this.resources.filter(this.isDialog).findIndex((re: Resource) => {
      const dialog = re as DialogResource;
      return dialog.referredLUFile === lu.id;
    });
    return index !== -1;
  };

  private generateErrorMessage = (invalidLuFile: LUResource[]) => {
    return invalidLuFile.reduce((msg, file) => {
      const fileErrorText = file.diagnostics.reduce((text, diagnostic) => {
        text += `\n ${diagnostic.message}`;
        return text;
      }, `In ${file.id}.lu: `);
      msg += `\n ${fileErrorText} \n`;
      return msg;
    }, '');
  };
}
