import { Path } from '../../../utility/path';
import { JsonWalk, VisitorFunc } from '../../../utility/jsonWalk';

import { FileInfo, Dialog } from './../interface';

export class DialogIndexer {
  public dialogs: Dialog[] = [];

  // find out all lg templates given dialog
  private ExtractLgTemplates(dialog: Dialog): string[] {
    const templates: string[] = [];

    /**
     *
     * @param path , jsonPath string
     * @param value , current node value
     *
     * @return boolean, true to stop walk
     */
    const visitor: VisitorFunc = (path: string, value: any): boolean => {
      // it's a valid schema dialog node.
      if (typeof value === 'object' && value.hasOwnProperty('$type')) {
        let target;
        switch (value.$type) {
          case 'Microsoft.SendActivity':
            target = value.activity;
            break;
          case 'Microsoft.TextInput':
            target = value.prompt;
            break;

          // if we want stop at some $type, do here
          case 'location':
            return true;
        }

        if (target && typeof target === 'string') {
          const reg = /\[(\w+)\]/g;
          let result;
          while ((result = reg.exec(target)) !== null) {
            const name = result[1];
            templates.push(name);
          }
        }
      }
      return false;
    };

    JsonWalk('$', dialog, visitor);

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
            const dialogJson = JSON.parse(file.content);
            const dialog = {
              id: 0,
              name: Path.basename(file.name, extName),
              content: dialogJson,
              lgTemplates: this.ExtractLgTemplates(dialogJson),
              relativePath: file.relativePath,
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
}
