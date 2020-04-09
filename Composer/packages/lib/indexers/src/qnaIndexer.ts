// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, QnaFile } from '@bfc/shared';

import { getBaseName } from './utils/help';
import { contentParse } from './utils/qnaUtil';

function index(files: FileInfo[]): QnaFile[] {
  if (files.length === 0) return [];
  const qnaFiles: QnaFile[] = [];
  for (const file of files) {
    const { name, content } = file;
    if (name.endsWith('.qna')) {
      const id = getBaseName(name, '.qna');
      const intents = contentParse(content);
      qnaFiles.push({ id, content, intents });
    }
  }
  return qnaFiles;
}

export const qnaIndexer = {
  index,
};
