import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { merge, set } from 'lodash';
import glob from 'globby';

import DIALOG_TEMPLATE from '../dialogTemplate.json';

import { applyAllParsers } from './pasers/index';
//import { IIndexer } from './indexers/interface';

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
}

interface BotConfig {
  files: string[];
  services: string[];
  entry: string;
}

function getAllConfig(botProjFilePath: string): BotFileConfig {
  return {
    botFilePath: botProjFilePath,
    botFileDir: path.dirname(botProjFilePath),
    botFileName: path.basename(botProjFilePath),
  };
}

export async function getParsedObjects(botProjFilePath: string = ''): Promise<any> {
  if (!botProjFilePath) {
    throw new Error(`No Bot Project! Cannot find files.`);
  }

  const fileList: FileInfo[] = [];

  const { botFileName, botFilePath, botFileDir } = getAllConfig(botProjFilePath);

  // get .bot file
  const botFileContent = await readFile(botFilePath, 'utf-8');
  fileList.push({ name: botFileName, content: botFileContent });

  // get 'files' from .bot file
  const botConfig: BotConfig = JSON.parse(botFileContent);
  const entryFileContent = await readFile(path.resolve(botFileDir, botConfig.entry), 'utf-8');
  fileList.push({ name: botConfig.entry, content: entryFileContent });

  if (botConfig !== undefined && Array.isArray(botConfig.files)) {
    for (const pattern of botConfig.files) {
      const paths = await glob(pattern, { cwd: botFileDir });

      for (const filePath of paths.sort()) {
        if (filePath == botConfig.entry) continue;
        const realFilePath: string = path.resolve(botFileDir, filePath);

        if ((await lstat(realFilePath)).isFile()) {
          const content: string = await readFile(realFilePath, 'utf-8');
          fileList.push({ name: filePath, content: content });
        }
      }
    }
  }

  return applyAllParsers(fileList);
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
