import { Path } from '../../../utility/path';
import { JsonWalk, VisitorFunc } from '../../../utility/jsonWalk';

import { FileInfo, Dialog } from './../interface';

export class DialogIndexer {
  public dialogs: Dialog[] = [];
  private botName: string;
  private entry: string = 'Main.dialog';

  constructor(botName: string) {
    this.botName = botName;
  }

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
          // match a template name
          // match a temlate func  e.g. `showDate()`
          const reg = /\[([A-Za-z_]\w+)(\(.*\))?\]/g;
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

  // find out all lu intents given dialog
  private ExtractLuIntents(dialog: Dialog): string[] {
    const intents: string[] = [];

    /**
     *
     * @param path , jsonPath string
     * @param value , current node value
     *
     * @return boolean, true to stop walk
     */
    const visitor: VisitorFunc = (path: string, value: any): boolean => {
      // it's a valid schema dialog node.
      if (typeof value === 'object' && value.hasOwnProperty('$type') && value.$type === 'Microsoft.IntentRule') {
        intents.push(value.intent);
      }
      return false;
    };

    JsonWalk('$', dialog, visitor);

    return intents;
  }

  public index = (files: FileInfo[]): Dialog[] => {
    this.dialogs = [];
    if (files.length !== 0) {
      const entry = this.entry;
      const botName = this.botName;
      let count = 1;

      for (const file of files) {
        const extName = Path.extname(file.name);
        try {
          if (extName === '.dialog' && !file.name.endsWith('.lu.dialog')) {
            const dialogJson = JSON.parse(file.content);
            const luFile = typeof dialogJson.recognizer === 'string' ? dialogJson.recognizer : '';
            const dialog = {
              id: 0,
              name: Path.basename(file.name, extName),
              displayName: file.name === entry ? botName : Path.basename(file.name, extName),
              content: dialogJson,
              lgTemplates: this.ExtractLgTemplates(dialogJson),
              luIntents: this.ExtractLuIntents(dialogJson),
              luFile: Path.basename(luFile, '.lu'),
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
