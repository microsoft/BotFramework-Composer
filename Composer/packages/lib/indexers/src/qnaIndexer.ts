// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo, QnAFile } from '@bfc/shared';

import { parse } from './utils/qnaUtil';
import { getBaseName } from './utils/help';
import { FileExtensions } from './utils/fileExtensions';

function index(files: FileInfo[]): QnAFile[] {
  if (files.length === 0) return [];
  const qnaFiles: QnAFile[] = [];
  for (const file of files) {
    const { name, content } = file;
    if (name.endsWith(FileExtensions.QnA)) {
      const id = getBaseName(name, FileExtensions.QnA);
      const data = parse(id, content);
      qnaFiles.push(data);
    }
  }
  return qnaFiles;
}

export const qnaIndexer = {
  index,
  parse,
};
