import { find } from 'lodash';

import { LocalDiskStorage } from '../storage/localDiskStorage';
import { LocationRef } from '../bot/interface';
import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';

import { IProjectTemplate } from './interface';

interface TemplateData {
  [key: string]: {
    name: string;
    description: string;
  };
}
const templates: TemplateData = {
  EchoBot: {
    name: 'Echo Bot',
    description: 'A bot that echoes and respond back whatever message the user entered',
  },
  EmptyBot: {
    name: 'Empty Bot',
    description: 'The very basic bot template that is ready for your creativity',
  },
  ToDoBot: {
    name: 'ToDo Bot',
    description: 'A bot that allows you add, list, remove to do items',
  },
  SampleBot: {
    name: 'SampleBot',
    description: 'A sample bot used for testing',
  },
};

export class AssetManager {
  public templateStorage: LocalDiskStorage;
  private assetsLibrayPath: string;
  private projectTemplates: IProjectTemplate[] = [];

  constructor(assetsLibrayPath: string) {
    this.assetsLibrayPath = assetsLibrayPath;
    this.templateStorage = new LocalDiskStorage();
  }

  public async getProjectTemplate() {
    const path = this.assetsLibrayPath + '/projects';
    const folders = await this.templateStorage.readDir(path);
    this.projectTemplates = [];
    const output = [];
    for (const name of folders) {
      const absPath = Path.join(path, name);
      if ((await this.templateStorage.stat(absPath)).isDir) {
        const base = { id: name, name: templates[name].name, description: templates[name].description };
        this.projectTemplates.push({ ...base, path: absPath });
        output.push(base);
      }
    }

    return output;
  }

  public async copyProjectTemplateTo(templateId: string, ref: LocationRef): Promise<LocationRef> {
    const template = find(this.projectTemplates, { id: templateId });
    if (template === undefined || template.path === undefined) {
      throw new Error(`no such template with id ${templateId}`);
    }
    // user storage maybe diff from template storage
    const dstStorage = StorageService.getStorageClient(ref.storageId);
    const dstDir = Path.resolve(ref.path);
    if (await dstStorage.exists(dstDir)) {
      throw new Error('already have this folder, please give another name');
    }

    await copyDir(template.path, this.templateStorage, dstDir, dstStorage);
    return ref;
  }
}
