import { Path } from '../../../utility/path';

import { Dialog, FileInfo } from './../interface';

export class DialogIndexer {
  public dialogs: Dialog[] = [];
  private botName: string;

  constructor(botName: string) {
    this.botName = botName;
  }

  public index = (files: FileInfo[]): Dialog[] => {
    this.dialogs = [];
    if (files.length !== 0) {
      const botName = this.botName;

      for (const file of files) {
        const extName = Path.extname(file.name);
        try {
          if (extName === '.dialog' && !file.name.endsWith('.lu.dialog')) {
            const dialogJson = JSON.parse(file.content);
            const luFile = typeof dialogJson.recognizer === 'string' ? dialogJson.recognizer : '';
            const lgFile = typeof dialogJson.generator === 'string' ? dialogJson.generator : '';
            const id = Path.basename(file.name, extName);
            const isRoot = id === 'Main';
            const dialog = {
              id,
              isRoot,
              displayName: isRoot ? `${botName}.Main` : id,
              content: dialogJson,
              relativePath: file.relativePath,
              luFile: Path.basename(luFile, '.lu'),
              lgFile: Path.basename(lgFile, '.lg'),
            };

            this.dialogs.push(dialog);
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
