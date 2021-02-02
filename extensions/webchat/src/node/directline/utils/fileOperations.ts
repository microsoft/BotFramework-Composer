/* eslint-disable security/detect-non-literal-fs-filename */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const writeFilePromisify = promisify(fs.writeFile);
const mkdirpPromisify = promisify(fs.mkdir);
const readFilePromisify = promisify(fs.readFile);

export const writeFile = async (path: string, content: any): Promise<void> => {
  await writeFilePromisify(path, content, { encoding: 'utf8', flag: 'w' });
};

export const mkdirp = async (filePath: string): Promise<void> => {
  const folderPath = path.dirname(filePath);
  if (!fs.existsSync(folderPath)) {
    await mkdirpPromisify(folderPath);
  }
};

export const readFile = async (path: string, encoding: BufferEncoding = 'base64'): Promise<string> => {
  const fileContent: string = await readFilePromisify(path, { encoding });
  return fileContent;
};
