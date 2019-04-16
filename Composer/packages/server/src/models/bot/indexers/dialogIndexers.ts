import path from 'path';

import { FileInfo } from './../interface';

export function dialogIndexer(files: FileInfo[]) {
  if (files.length === 0) return [];

  const dialogs = [];
  const entry = files[0].content.entry;
  let count = 1;

  for (const file of files) {
    const extName = path.extname(file.name);

    if (extName === '.dialog') {
      const dialog = {
        id: count++,
        name: path.basename(file.name, extName),
        content: JSON.parse(file.content),
      };

      if (file.name === entry) {
        dialog['id'] = 0;
        dialogs.unshift(dialog);
      } else {
        dialogs.push(dialog);
      }
    }
  }

  return dialogs;
}
