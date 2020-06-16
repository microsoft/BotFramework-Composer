// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { sectionHandler } from '@microsoft/bf-lu/lib/parser/composerindex';
import {
  FileInfo,
  QnaFile,
  // LuParsed,
  // LuSectionTypes,
  // LuIntentSection,
  // Diagnostic,
  // Position,
  // Range,
  // DiagnosticSeverity,
} from '@bfc/shared';
import get from 'lodash/get';

import { getBaseName } from './utils/help';
import { FileExtensions } from './utils/fileExtensions';

const { luParser } = sectionHandler;

function parse(content: string, id = '') {
  //To do handle Errors in paresd file
  console.log(luParser.parse(content));
  const { Sections } = luParser.parse(content);
  const qnaPairs: any[] = [];
  Sections.forEach((section) => {
    const range = {
      startLineNumber: get(section, 'ParseTree.start.line', 0),
      endLineNumber: get(section, 'ParseTree.stop.line', 0),
    };
    qnaPairs.push({ ...section, range });
  });
  return {
    empty: !Sections.length,
    qnaPairs,
    fileId: id,
    //diagnostics,
  };
}

function index(files: FileInfo[]): QnaFile[] {
  if (files.length === 0) return [];
  const qnaFiles: QnaFile[] = [];
  for (const file of files) {
    const { name, content } = file;
    if (name.endsWith(FileExtensions.Qna)) {
      const id = getBaseName(name, FileExtensions.Qna);
      const data = parse(content, id);
      qnaFiles.push({ id, content, ...data });
    }
  }
  return qnaFiles;
}

export const qnaIndexer = {
  index,
  parse,
};
