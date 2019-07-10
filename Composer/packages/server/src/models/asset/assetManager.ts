import { find } from 'lodash';

import { LocalDiskStorage } from '../storage/localDiskStorage';
import { LocationRef } from '../bot/interface';
import { Path } from '../../utility/path';
import { copyDir } from '../../utility/storage';
import StorageService from '../../services/storage';

import { IProjectTemplate } from './interface';

const templateDescriptions: { [key: string]: string } = {
  EchoBot: 'This is bot that can echo back what you say to it.',
  EmptyBot: 'This is a bot that can do nothing.',
  ToDoBot: 'This is a bot that demonstrates management of a ToDo list.',
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
        const base = { id: name, name: name, description: templateDescriptions[name] };
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
