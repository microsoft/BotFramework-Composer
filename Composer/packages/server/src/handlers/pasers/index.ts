import path from 'path';

import { FileInfo } from '../fileHandler';

import { dialogParse } from './dialogParser';
import { botProjectParse } from './botProjectPaser';

export * from './dialogParser';
export * from './botProjectPaser';

const parsers: { [key: string]: any } = {
  '.dialog': dialogParse,
  '.botproj': botProjectParse,
};

export function applyAllParsers(files: FileInfo[]) {
  const result = files.reduce((result: { [key: string]: any }, file) => {
    const extName: string = path.extname(file.name);
    if (parsers[extName]) {
      const value = parsers[extName](file, result);
      if (!result[value.type]) {
        result[value.type] = [];
      }
      result[value.type].push(value.json);
    }
    return result;
  }, {});

  return result;
}
