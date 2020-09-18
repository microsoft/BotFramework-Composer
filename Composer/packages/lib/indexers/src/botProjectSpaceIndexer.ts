// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotProjectSpace, FileInfo } from '@bfc/shared';

const index = (botProjectSpaceFiles: FileInfo[]) => {
  // Handle botproject files for multiple env when Composer brings in Env
  return botProjectSpaceFiles.map((file) => {
    const { content } = file;
    const jsonContent: BotProjectSpace = JSON.parse(content);
    return jsonContent;
  });
};

export const botProjectSpaceIndexer = {
  index,
};
