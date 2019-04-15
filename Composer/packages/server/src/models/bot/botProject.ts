// import fs from 'fs';
import path from 'path';
// import { promisify } from 'util';

import { merge, set } from 'lodash';
import glob from 'globby';

import DIALOG_TEMPLATE from '../../store/dialogTemplate.json';

import { BotProjectRef, FileInfo, BotProjectFileContent } from './interface';

// const readFile = promisify(fs.readFile);
// const writeFile = promisify(fs.writeFile);
// const lstat = promisify(fs.lstat);
const isDialogExtension = (input: string): boolean => input.indexOf('.dialog') !== -1;

// TODO:
// 1. refactor this class to use on IFileStorage instead of operating on fs
// 2. refactor this layer, to operate on dialogs, not files
export class BotProject {
  public ref: BotProjectRef;

  public name: string;
  public absolutePath: string;
  public dir: string;
  constructor(ref: BotProjectRef) {
    this.ref = ref;

    this.absolutePath = path.resolve(this.ref.path);
    this.dir = path.dirname(this.absolutePath);
    this.name = path.basename(this.absolutePath);
  }

  public getFiles = async () => {
    const fileList: FileInfo[] = [];

    // get .bot file
    const botFileContent = await readFile(this.absolutePath, 'utf-8');
    fileList.push({
      name: this.name,
      content: JSON.parse(botFileContent),
      path: this.absolutePath,
      dir: this.dir,
      relativePath: path.relative(this.dir, this.absolutePath),
    });

    // get 'files' from .bot file
    const botConfig: BotProjectFileContent = JSON.parse(botFileContent);
    if (botConfig !== undefined && Array.isArray(botConfig.files)) {
      for (const pattern of botConfig.files) {
        const paths = await glob(pattern, { cwd: this.dir });
        // find the index of the entry dialog defined in the botproject
        // save & remove it from the paths array before it is sorted
        let mainPath = '';
        if (isDialogExtension(pattern)) {
          const mainPathIndex = paths.findIndex(elem => elem.indexOf(botConfig.entry) !== -1);
          mainPath = paths[mainPathIndex];
          paths.splice(mainPathIndex, 1);
        }

        for (const filePath of paths.sort()) {
          const realFilePath: string = path.resolve(this.dir, filePath);
          // skip lg files for now
          if (!realFilePath.endsWith('.lg') && (await lstat(realFilePath)).isFile()) {
            const content: string = await readFile(realFilePath, 'utf-8');
            fileList.push({
              name: filePath,
              content: JSON.parse(content),
              path: realFilePath,
              dir: this.dir,
              relativePath: path.relative(this.dir, realFilePath),
            });
          }
        }

        // resolve the entry dialog path and add it to the front of the
        // now sorted paths array
        if (isDialogExtension(pattern)) {
          const mainFilePath = path.resolve(this.dir, mainPath);
          if (!mainFilePath.endsWith('.lg') && (await lstat(mainFilePath)).isFile()) {
            const content: string = await readFile(mainFilePath, 'utf-8');
            fileList.unshift({
              name: mainPath,
              content: JSON.parse(content),
              path: mainFilePath,
              dir: this.dir,
              relativePath: path.relative(this.dir, mainFilePath),
            });
          }
        }
      }
    }

    return fileList;
  };

  public createFileFromTemplate = async (name: string, types: string[]) => {
    const absolutePath: string = path.join(this.dir, `${name.trim()}.dialog`);
    const newDialog = merge({}, DIALOG_TEMPLATE);

    types.forEach((type: string, idx: number) => {
      set(newDialog, `rules[0].steps[${idx}].$type`, type.trim());
    });

    await writeFile(absolutePath, JSON.stringify(newDialog, null, 2) + '\n', {});
  };

  public updateFile = async (name: string, content: any) => {
    const absolutePath: string = path.join(this.dir, name);
    await writeFile(absolutePath, JSON.stringify(content, null, 2) + '\n');
  };
}
