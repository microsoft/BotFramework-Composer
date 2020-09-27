// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotProjectSpace, FileInfo } from '@bfc/shared';

import { getBaseName } from './utils/help';

const index = (botProjectSpaceFiles: FileInfo[]) => {
  // Handle botproject files for multiple env when Composer brings in Env
  return botProjectSpaceFiles.map((file) => {
    const { content, lastModified, name } = file;
    const jsonContent: BotProjectSpace = JSON.parse(content);
    return { content: jsonContent, id: getBaseName(name, '.botproj'), lastModified };
  });
};

export const botProjectSpaceIndexer = {
  index,
};
