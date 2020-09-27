// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import { existsSync, mkdirp, mkdirpSync, readFileSync, writeFile, writeFileSync } from 'fs-extra';

export const ensureDirectory = async (dirPath: string) => await mkdirp(dirPath);

export const ensureJsonFileSync = (filePath: string, defaultContent: { [key: string]: {} }) => {
  if (!existsSync(filePath)) {
    mkdirpSync(path.dirname(filePath));
    writeFileSync(filePath, JSON.stringify(defaultContent, null, 4), { encoding: 'utf8' });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const writeJsonFileSync = async (jsonFilePath: string, content: Record<string, any>) => {
  await ensureDirectory(path.dirname(jsonFilePath));
  return await writeFile(jsonFilePath, JSON.stringify(content, null, 4), { encoding: 'utf8' });
};

export const readTextFileSync = (filePath: string) => readFileSync(filePath, { encoding: 'utf8' });
