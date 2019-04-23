import path from 'path';

import { IFileStorage } from 'src/models/storage/interface';

import { FileInfo, Dialog } from './../interface';

export class DialogIndexer {
  public dialogs: Dialog[] = [];
  public storage: IFileStorage;

  constructor(storage: IFileStorage) {
    this.storage = storage;
  }

  private _dialogParse(content: string) {
    return JSON.parse(content);
  }

  public index = (files: FileInfo[]): Dialog[] => {
    this.dialogs = [];
    if (files.length !== 0) {
      const entry = files[0].content.entry;
      let count = 1;

      for (const file of files) {
        const extName = path.extname(file.name);

        if (extName === '.dialog') {
          const dialog = {
            id: 0,
            name: path.basename(file.name, extName),
            content: this._dialogParse(file.content),
            path: file.path,
          };

          if (file.name === entry) {
            this.dialogs.unshift(dialog);
          } else {
            dialog.id = count++;
            this.dialogs.push(dialog);
          }
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
    await this.storage.writeFile(dialog.path, JSON.stringify(content, null, 2) + '\n');
    const dialogContent = await this.storage.readFile(dialog.path);
    this.dialogs[index].content = JSON.parse(dialogContent);

    return this.dialogs[index].content;
  };

  public addDialog = (name: string, content: string, path: string) => {
    this.dialogs.push({ name, content: JSON.parse(content), id: this.dialogs.length, path: path });
    return content;
  };
}
