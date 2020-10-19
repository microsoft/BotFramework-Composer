// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileExtensions, FileInfo, FormDialogSchema } from '@bfc/shared';

import { getBaseName } from './utils/help';

const index = (files: FileInfo[]): FormDialogSchema[] =>
  files
    .filter((file) => file.name.endsWith(FileExtensions.FormDialogSchema))
    .map((file) => {
      const { content, name } = file;
      return { id: getBaseName(name, FileExtensions.FormDialogSchema), content };
    });

export const formDialogSchemaIndexer = {
  index,
};
