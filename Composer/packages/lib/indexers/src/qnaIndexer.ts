// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo, QnAFile } from '@bfc/shared';

import { parse as utilParse } from './utils/qnaUtil';
import { getBaseName } from './utils/help';
import { FileExtensions } from './utils/fileExtensions';

function parse(content: string, id = ''): QnAFile {
  return utilParse(id, content);
}

function index(files: FileInfo[]): QnAFile[] {
  if (files.length === 0) return [];
  const qnaFiles: QnAFile[] = [];
  for (const file of files) {
    const { name, content } = file;
    if (name.endsWith(FileExtensions.QnA)) {
      const id = getBaseName(name, FileExtensions.QnA);
      const data = parse(content, id);
      qnaFiles.push(data);
    }
  }
  return qnaFiles;
}

export const qnaIndexer = {
  index,
  parse,
};
