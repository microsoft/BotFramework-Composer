import path from 'path';

import { FileInfo } from '../fileHandler';

export function dialogParse(file: FileInfo, result: { [key: string]: any }) {
  const baseName = path.basename(file.name, '.dialog');
  const json = {
    name: baseName,
    id: result.dialogs ? result.dialogs.length : 0,
    content: JSON.parse(file.content),
  };
  return { type: 'dialogs', json };
}
