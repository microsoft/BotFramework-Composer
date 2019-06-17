import { find } from 'lodash';

import { LocalDiskStorage } from '../storage/localDiskStorage';
import { LocationRef } from '../bot/interface';
import { Path } from '../../utility/path';
import StorageService from '../../services/storage';
import { IFileStorage } from '../storage/interface';

import { IProjectTemplate } from './interface';

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
        const base = { id: name, name: name, description: '' };
        this.projectTemplates.push({ ...base, path: absPath });
        output.push(base);
      }
    }

    return output;
  }

  public async copyProjectTemplateTo(templateId: string, ref: LocationRef): Promise<LocationRef> {
    const template = find(this.projectTemplates, { id: templateId });
    if (template !== undefined && template.path !== undefined) {
      // user storage maybe diff from template storage
      const dstStorage = StorageService.getStorageClient(ref.storageId);
      const dstDir = Path.resolve(ref.path);
      if (await dstStorage.exists(dstDir)) {
        throw new Error('already have this folder, please give another name');
      }
      await dstStorage.mkDir(dstDir, { recursive: true });
      await this._copy(template.path, dstDir, dstStorage);
      const botprojPaths = await dstStorage.glob('**/*.botproj', ref.path);
      if (botprojPaths && botprojPaths.length === 1) {
        return {
          storageId: ref.storageId,
          path: Path.join(ref.path, botprojPaths[0]),
        };
      } else {
        throw new Error('more than one botproj');
      }
    }
    throw new Error('no template botproject');
  }

  private _copy = async (src: string, dstDir: string, dstStorage: IFileStorage) => {
    const storage = this.templateStorage;
    const paths = await storage.readDir(src);
    for (const path of paths) {
      const _src = `${src}/${path}`;
      const _dst = `${dstDir}/${path}`;
      if ((await storage.stat(_src)).isFile) {
        const content = await storage.readFile(_src);
        await storage.writeFile(_dst, content);
      } else {
        await this._copy(_src, _dst, dstStorage);
      }
    }
  };
}
