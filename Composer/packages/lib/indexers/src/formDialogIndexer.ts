// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, FormDialogFile } from '@bfc/shared';

import { getBaseName } from './utils/help';

function index(files: FileInfo[]): FormDialogFile[] {
  if (!files || files.length === 0) return [];
  const formDialogFiles: FormDialogFile[] = [];
  for (const file of files) {
    const { name, content } = file;
    if (name.endsWith('.schema')) {
      const id = getBaseName(name, '.schema');
      formDialogFiles.push({ id, content });
    }
  }
  return formDialogFiles;
}

export const formDialogIndexer = {
  index,
};
