import path from 'path';

import { FileInfo } from '../fileHandler';

import { IIndexer } from './interface';

export class DialogIndexer implements IIndexer {
  type: string;
  extName: string;

  constructor() {
    this.type = 'dialogs';
    this.extName = '.dialog';
  }

  check = (extName: string): boolean => {
    return this.extName === extName;
  };

  paser = (entry: string, files: FileInfo[], result: { [key: string]: any }): any => {
    let count = 1;

    const unHandledFiles = files.filter(file => {
      const extName = path.extname(file.name);
      const isDialog = this.check(extName);
      const type = this.type;
      if (isDialog) {
        const baseName = path.basename(file.name, extName);
        const dialog = { name: baseName, json: JSON.parse(file.content) };
        if (!result[type]) {
          result[type] = [];
        }

        if (file.name === entry) {
          result[type].unshift({ id: 0, ...dialog });
        } else {
          result[type].push({ id: count++, ...dialog });
        }
      }

      return !isDialog;
    });

    return { files: unHandledFiles, result };
  };
}
