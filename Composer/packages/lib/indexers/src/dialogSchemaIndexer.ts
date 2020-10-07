// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, DialogSchemaFile } from '@bfc/shared';

import { getBaseName } from './utils/help';

function index(files: FileInfo[]): DialogSchemaFile[] {
  return files.map(({ content: fileContent, name }) => {
    try {
      const id = getBaseName(name, '.dialog.schema');
      const content = JSON.parse(fileContent);

      return {
        content,
        id,
      };
    } catch (error) {
      throw new Error(`parse failed at ${name}, ${error}`);
    }
  });
}

export const dialogSchemaIndexer = {
  index,
};
