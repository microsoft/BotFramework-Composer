import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { merge, set } from 'lodash';
import glob from 'globby';

import DIALOG_TEMPLATE from '../../store/dialogTemplate.json';

import { BotProjectRef, FileInfo, BotProjectFileContent, Dialog } from './interface';
import { dialogIndexer } from './indexers';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const lstat = promisify(fs.lstat);
const mkDir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
// TODO:
// 1. refactor this class to use on IFileStorage instead of operating on fs
// 2. refactor this layer, to operate on dialogs, not files
export class BotProject {
  public ref: BotProjectRef;

  public name: string;
  public absolutePath: string;
  public dir: string;
  public files: FileInfo[] = [];
  public dialogs: Dialog[] = [];
  public botFile: FileInfo | any = null;

  constructor(ref: BotProjectRef) {
    this.ref = ref;

    this.absolutePath = path.resolve(this.ref.path);
    this.dir = path.dirname(this.absolutePath);
    this.name = path.basename(this.absolutePath);
  }

  init = async () => {
    this.files = await this.loadResource();
    this.dialogs = dialogIndexer(this.files);
    this.botFile = this.files[0];
  };

  public loadResource = async () => {
    const fileList: FileInfo[] = [];
    // get .bot file
    const botFileContent = await readFile(this.absolutePath, 'utf-8');
    // get 'files' from .bot file
    const botConfig: BotProjectFileContent = JSON.parse(botFileContent);

    if (botConfig !== undefined && Array.isArray(botConfig.files)) {
      fileList.push({
        name: this.name,
        content: botConfig,
        path: this.absolutePath,
        relativePath: path.relative(this.dir, this.absolutePath),
      });

      for (const pattern of botConfig.files) {
        const paths = await glob(pattern, { cwd: this.dir });

        for (const filePath of paths.sort()) {
          const realFilePath: string = path.resolve(this.dir, filePath);
          // skip lg files for now
          if ((await lstat(realFilePath)).isFile()) {
            const content: string = await readFile(realFilePath, 'utf-8');
            fileList.push({
              name: filePath,
              content: content,
              path: realFilePath,
              relativePath: path.relative(this.dir, realFilePath),
            });
          }
        }
      }
    }

    return fileList;
  };

  public getFiles = () => {
    return this.files;
  };

  public getProject = () => {
    return {
      dialogs: this.dialogs,
      botFile: this.botFile,
    };
  };

  public createDialogFromTemplate = async (name: string, types: string[]) => {
    const absolutePath: string = path.join(this.dir, `${name.trim()}.dialog`);
    const newDialog = merge({}, DIALOG_TEMPLATE);

    types.forEach((type: string, idx: number) => {
      set(newDialog, `rules[0].steps[${idx}].$type`, type.trim());
    });

    await writeFile(absolutePath, JSON.stringify(newDialog, null, 2) + '\n', {});
    this.dialogs.push({ name, content: newDialog, id: this.dialogs.length });
    return this.dialogs;
  };

  public updateFile = async (name: string, content: any) => {
    const absolutePath: string = path.join(this.dir, name);
    await writeFile(absolutePath, JSON.stringify(content, null, 2) + '\n');
  };

  public updateDialog = async (name: string, content: any) => {
    await this.updateFile(`${name}.dialog`, content);
    return this.dialogs.map(dialog => {
      if (dialog.name === name) dialog.content = content;
      return dialog;
    });
  };

  public updateBotFile = async (name: string, content: any) => {
    await this.updateFile(`${name}`, content);
    this.botFile.content = content;
    return this.botFile;
  };

  public copyProject = async (prevFiles: FileInfo[]) => {
    if (!(await exists(this.dir))) {
      await mkDir(this.dir);
    }
    for (const index in prevFiles) {
      const file = prevFiles[index];
      const absolutePath = path.resolve(this.dir, file.relativePath);
      const content = index === '0' ? JSON.stringify(file.content, null, 2) + '\n' : file.content;
      await writeFile(absolutePath, content, {});
    }
  };
}
