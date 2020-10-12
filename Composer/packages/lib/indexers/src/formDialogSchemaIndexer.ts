// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';

import { getBaseName } from './utils/help';

const index = (formDialogSchemaFiles: FileInfo[]) => {
  return formDialogSchemaFiles.map((file) => {
    const { content, lastModified, name } = file;
    return { content, id: getBaseName(name, '.form-dialog'), lastModified };
  });
};

export const formDialogSchemaIndexer = {
  index,
};
