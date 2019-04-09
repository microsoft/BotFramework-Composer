import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { merge, set } from 'lodash';
import glob from 'globby';

import DIALOG_TEMPLATE from '../dialogTemplate.json';

import { FileInfo } from './fileHandler';

const readFile = promisify(fs.readFile);
const lstat = promisify(fs.lstat);
const writeFile = promisify(fs.writeFile);

interface BotFileConfig {
  botFilePath: string;
  botFileDir: string;
  botFileName: string;
}

export interface FileInfo {
  name: string;
  content: any;
  path: string;
  dir: string;
  relativePath: string;
}

interface BotConfig {
  files: string[];
  services: string[];
  entry: string;
}

class BasicFile implements FileInfo {
  name: string;
  content: any;
  path: string;
  dir: string;
  relativePath: string;
  public constructor(name: string, content: string, path: string, dir: string, relativePath: string) {
    this.name = name;
    this.content = content;
    this.path = path;
    this.dir = dir;
    this.relativePath = relativePath;
  }
}

class JsonFile implements FileInfo {
  name: string;
  content: any;
  path: string;
  dir: string;
  relativePath: string;
  public constructor(name: string, content: string, path: string, dir: string, relativePath: string) {
    this.name = name;
    this.content = JSON.parse(content);
    this.path = path;
    this.dir = dir;
    this.relativePath = relativePath;
  }
}

class BotFile extends JsonFile {}

class DialogFile extends JsonFile {}

class LuFile extends BasicFile {}

class LgFile extends BasicFile {}

const FileRegistration: { [key: string]: any } = {
  '.dialog': { type: 'dialogFiles', pick: DialogFile },
  '.lu': { type: 'luFiles', pick: LuFile },
  '.lg': { type: 'lgFiles', pick: LgFile },
  '.botproj': { type: 'botFiles', pick: BotFile },
};

function getFileMap(extName: string) {
  if (FileRegistration.hasOwnProperty(extName)) {
    return FileRegistration[extName];
  } else {
    return { type: 'undefinedFiles', pick: BasicFile };
  }
}

function getAllConfig(botProjFilePath: string): BotFileConfig {
  return {
    botFilePath: botProjFilePath,
    botFileDir: path.dirname(botProjFilePath),
    botFileName: path.basename(botProjFilePath),
  };
}

// todo: extract to isomorphic helpers?
const isDialogExtension = (input: string): boolean => input.indexOf('.dialog') !== -1;

export async function getFiles(botProjFilePath: string = ''): Promise<{ [key: string]: FileInfo[] }> {
  if (!botProjFilePath) {
    throw new Error(`No Bot Project! Cannot find files.`);
  }

  const filesMap: { [key: string]: FileInfo[] } = {};

  const { botFileName, botFilePath, botFileDir } = getAllConfig(botProjFilePath);

  // get .bot file
  const botFileContent = await readFile(botFilePath, 'utf-8');
  const extName = path.extname(botFileName);
  const { type, pick } = getFileMap(extName);
  filesMap[type] = [
    new pick(botFileName, botFileContent, botFilePath, botFileDir, path.relative(botFileDir, botFilePath)),
  ];

  // get 'files' from .bot file
  const botConfig: BotConfig = JSON.parse(botFileContent);
  if (botConfig !== undefined && Array.isArray(botConfig.files)) {
    for (const pattern of botConfig.files) {
      const paths = await glob(pattern, { cwd: botFileDir });
      // find the index of the entry dialog defined in the botproject
      // save & remove it from the paths array before it is sorted
      let mainPath = '';
      if (isDialogExtension(pattern)) {
        const mainPathIndex = paths.findIndex(elem => elem.indexOf(botConfig.entry) !== -1);
        mainPath = paths[mainPathIndex];
        paths.splice(mainPathIndex, 1);
      }

      for (const filePath of paths.sort()) {
        const realFilePath: string = path.resolve(botFileDir, filePath);
        if ((await lstat(realFilePath)).isFile()) {
          const content: string = await readFile(realFilePath, 'utf-8');
          const extName = path.extname(realFilePath);
          const { type, pick } = getFileMap(extName);
          if (typeof filesMap[type] === 'undefined') {
            filesMap[type] = [];
          }
          filesMap[type].push(
            new pick(filePath, content, realFilePath, botFileDir, path.relative(botFileDir, realFilePath))
          );
        }
      }

      // resolve the entry dialog path and add it to the front of the
      // now sorted paths array
      if (isDialogExtension(pattern)) {
        const mainFilePath = path.resolve(botFileDir, mainPath);
        if ((await lstat(mainFilePath)).isFile()) {
          const content: string = await readFile(mainFilePath, 'utf-8');
          const extName = path.extname(mainFilePath);
          const { type, pick } = getFileMap(extName);
          if (typeof filesMap[type] === 'undefined') {
            filesMap[type] = [];
          }
          filesMap[type].unshift(
            new pick(mainPath, content, mainFilePath, botFileDir, path.relative(botFileDir, mainFilePath))
          );
        }
      }
    }
  }

  return { ...filesMap };
}

export async function updateFile(name: string, content: any, botProjFilePath: string = ''): Promise<void> {
  if (!botProjFilePath) {
    throw new Error(`No Bot Project! Cannot update ${name}`);
  }
  const { botFileDir } = getAllConfig(botProjFilePath);
  const realFilePath: string = path.join(botFileDir, name);

  await writeFile(realFilePath, JSON.stringify(content, null, 2) + '\n');
}

export async function createFromTemplate(name: string, types: string[], botProjFilePath: string = ''): Promise<void> {
  if (!botProjFilePath) {
    throw new Error(`No Bot Project! Cannot update ${name}`);
  }

  const trimmedName = name.trim();

  const { botFileDir } = getAllConfig(botProjFilePath);
  const realFilePath: string = path.join(botFileDir, `${trimmedName}.dialog`);
  const newDialog = merge({}, DIALOG_TEMPLATE);

  types.forEach((type: string, idx: number) => {
    set(newDialog, `rules[0].steps[${idx}].$type`, type.trim());
  });

  await writeFile(realFilePath, JSON.stringify(newDialog, null, 2) + '\n', {});
}
