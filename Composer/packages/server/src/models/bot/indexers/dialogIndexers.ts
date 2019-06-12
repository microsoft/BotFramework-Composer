import { IFileStorage } from 'src/models/storage/interface';

import { Path } from '../../../utility/path';

import { FileInfo, Dialog } from './../interface';

export class DialogIndexer {
  public dialogs: Dialog[] = [];
  public storage: IFileStorage;
  private dir: string;

  constructor(storage: IFileStorage, dir: string) {
    this.storage = storage;
    this.dir = dir;
  }

  // find out all lg templates given dialog
  private lgTemplateWalker(dialogJsonString: string): string[] {
    const templates: string[] = [];
    const dialogJson = JSON.parse(dialogJsonString);

    const walker = function(node: any) {
      if (node === null || Array.isArray(node) || typeof node !== 'object') return;

      Object.keys(node).forEach(key => {
        const nodeValue = node[key];
        if (typeof nodeValue === 'string') {
          const templateRegExp = /\[(\w+)\]/g;
          let matchResult;
          while ((matchResult = templateRegExp.exec(nodeValue)) !== null) {
            const templateName = matchResult[1];
            templates.push(templateName);
          }
        } else if (Array.isArray(nodeValue)) {
          nodeValue.forEach(child => {
            walker(child);
          });
        } else if (typeof nodeValue === 'object') {
          const child = nodeValue;
          walker(child);
        }
      });
    };

    walker(dialogJson);

    return templates;
  }

  public index = (files: FileInfo[]): Dialog[] => {
    this.dialogs = [];
    if (files.length !== 0) {
      const entry = files[0].content.entry;
      let count = 1;

      for (const file of files) {
        const extName = Path.extname(file.name);
        try {
          if (extName === '.dialog' && !file.name.endsWith('.lu.dialog')) {
            const dialog = {
              id: 0,
              name: Path.basename(file.name, extName),
              content: JSON.parse(file.content),
              lgTemplates: this.lgTemplateWalker(file.content),
              relativePath: Path.relative(this.dir, file.path),
            };

            if (file.name === entry) {
              this.dialogs.unshift(dialog);
            } else {
              dialog.id = count++;
              this.dialogs.push(dialog);
            }
          }
        } catch (e) {
          throw new Error(`parse failed at ${file.name}, ${e}`);
        }
      }
    }

    return this.dialogs;
  };

  public getDialogs = () => {
    return this.dialogs;
  };

  public updateDialogs = async (name: string, content: any): Promise<Dialog[]> => {
    const index = this.dialogs.findIndex(dialog => {
      return dialog.name === name;
    });

    const dialog = this.dialogs[index];

    const absolutePath = Path.join(this.dir, dialog.relativePath);

    await this.storage.writeFile(absolutePath, JSON.stringify(content, null, 2) + '\n');
    const dialogContent = await this.storage.readFile(absolutePath);
    this.dialogs[index].content = JSON.parse(dialogContent);

    return this.dialogs[index].content;
  };

  public addDialog = (name: string, content: string, relativePath: string) => {
    this.dialogs.push({
      name,
      content: JSON.parse(content),
      lgTemplates: [],
      id: this.dialogs.length,
      relativePath: relativePath,
    });
    return content;
  };
}
