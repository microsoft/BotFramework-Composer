import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { merge, set } from 'lodash';
import glob from 'globby';

import DIALOG_TEMPLATE from '../dialogTemplate.json';

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
  content: string;
  path: string;
  dir: string;
  relativePath: string;
}

interface BotConfig {
  files: string[];
}

function getAllConfig(botProjFilePath: string): BotFileConfig {
  return {
    botFilePath: botProjFilePath,
    botFileDir: path.dirname(botProjFilePath),
    botFileName: path.basename(botProjFilePath),
  };
}

export async function getFiles(botProjFilePath: string = ''): Promise<FileInfo[]> {
  if (!botProjFilePath) {
    throw new Error(`No Bot Project! Cannot find files.`);
  }

  const fileList: FileInfo[] = [];

  const { botFileName, botFilePath, botFileDir } = getAllConfig(botProjFilePath);

  // get .bot file
  const botFileContent = await readFile(botFilePath, 'utf-8');
  fileList.push({
    name: botFileName,
    content: botFileContent,
    path: botFilePath,
    dir: botFileDir,
    relativePath: path.relative(botFileDir, botFilePath),
  });

  // get 'files' from .bot file
  const botConfig: BotConfig = JSON.parse(botFileContent);
  if (botConfig !== undefined && Array.isArray(botConfig.files)) {
    for (const pattern of botConfig.files) {
      const paths = await glob(pattern, { cwd: botFileDir });

      for (const filePath of paths) {
        const realFilePath: string = path.join(botFileDir, filePath);
        if ((await lstat(realFilePath)).isFile()) {
          const content: string = await readFile(realFilePath, 'utf-8');
          fileList.push({
            name: filePath,
            content: content,
            path: realFilePath,
            dir: botFileDir,
            relativePath: path.relative(botFileDir, realFilePath),
          });
        }
      }
    }
  }

  return fileList;
}

export async function updateFile(name: string, content: string, botProjFilePath: string = ''): Promise<void> {
  if (!botProjFilePath) {
    throw new Error(`No Bot Project! Cannot update ${name}`);
  }
  const { botFileDir } = getAllConfig(botProjFilePath);
  const realFilePath: string = path.join(botFileDir, name);

  const parsed = JSON.parse(content);
  await writeFile(realFilePath, JSON.stringify(parsed, null, 2) + '\n');
}

export async function createFromTemplate(name: string, types: string[], botProjFilePath: string = ''): Promise<void> {
  if (!botProjFilePath) {
    throw new Error(`No Bot Project! Cannot update ${name}`);
  }

  const trimmedName = name.trim();

  const { botFileDir } = getAllConfig(botProjFilePath);
  const realFilePath: string = path.join(botFileDir, `${trimmedName}.dialog`);
  const newDialog = merge({}, DIALOG_TEMPLATE, { $id: trimmedName });

  types.forEach((type: string, idx: number) => {
    set(newDialog, `rules[0].steps[${idx}].$type`, type.trim());
  });

  await writeFile(realFilePath, JSON.stringify(newDialog, null, 2) + '\n', {});
}
