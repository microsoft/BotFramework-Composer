// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, QnaFile } from '@bfc/shared';

import { getBaseName } from './utils/help';

function index(files: FileInfo[]): QnaFile[] {
  if (files.length === 0) return [];
  const qnaFiles: QnaFile[] = [];
  for (const file of files) {
    const { name, content } = file;
    if (name.endsWith('.qna')) {
      const id = getBaseName(name, '.qna');
      qnaFiles.push({ id, content });
    }
  }
  return qnaFiles;
}

export const qnaIndexer = {
  index,
};
