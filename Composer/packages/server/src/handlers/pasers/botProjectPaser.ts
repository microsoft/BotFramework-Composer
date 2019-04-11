import path from 'path';

import { FileInfo } from '../fileHandler';

export function botProjectParse(file: FileInfo) {
  const baseName = path.basename(file.name, '.botproj');
  const json = {
    name: baseName,
    content: JSON.parse(file.content),
  };
  return { type: 'botProject', json };
}
