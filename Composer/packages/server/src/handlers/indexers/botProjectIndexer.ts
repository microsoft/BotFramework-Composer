import path from 'path';

import { FileInfo } from '../fileHandler';

import { IIndexer } from './interface';

export class BotProjectIndexer implements IIndexer {
  type: string;
  extName: string;

  constructor() {
    this.type = 'botProject';
    this.extName = '.botproj';
  }

  check = (extName: string): boolean => {
    return this.extName === extName;
  };

  paser = (entry: string, files: FileInfo[], result: { [key: string]: any }): any => {
    const unHandledFiles = files.filter(file => {
      const extName = path.extname(file.name);
      const isProject = this.check(extName);
      const type = this.type;
      if (isProject) {
        const baseName = path.basename(file.name, extName);
        result[type] = { name: baseName, json: JSON.parse(file.content) };
      }

      return !isProject;
    });

    return { files: unHandledFiles, result };
  };
}
