import { find } from 'lodash';

import { LocalDiskStorage } from './../storage/localDiskStorage';
import { BotProjectRef } from './../bot/interface';
import { ITemplate } from './interface';
import { Path } from './../../utility/path';

export class AssetsManager {
  public templateStorage: LocalDiskStorage;
  private assetsLibrayPath: string;
  private projectTemplates: ITemplate[] = [];

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

  public async copyProjectTemplateTo(templateId: string, ref: BotProjectRef) {
    const template = find(this.projectTemplates, { id: templateId });
    if (template !== undefined && template.path !== undefined) {
      const dir = Path.dirname(Path.resolve(ref.path));
      await this.templateStorage.mkDir(dir);
      await this._copy(template.path, dir);
    }
  }

  private _copy = async (src: string, dst: string) => {
    const storage = this.templateStorage;
    const paths = await storage.readDir(src);
    for (const path of paths) {
      const _src = `${src}/${path}`;
      const _dst = `${dst}/${path}`;
      if ((await storage.stat(_src)).isFile) {
        const content = await storage.readFile(_src);
        await storage.writeFile(_dst, content);
      } else {
        await storage.mkDir(_dst);
        await this._copy(_src, _dst);
      }
    }
  };
}
