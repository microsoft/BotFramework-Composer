// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parser } from '@bfcomposer/bf-lu/lib/parser';

import { FileInfo, LuFile, LuDiagnostic } from './type';
import { getBaseName } from './utils/help';

async function index(files: FileInfo[]) {
  if (files.length === 0) return [];
  const luFiles: LuFile[] = [];
  for (const file of files) {
    if (file.name.endsWith('.lu')) {
      const diagnostics: LuDiagnostic[] = [];
      let parsedContent: any = {};
      try {
        parsedContent = await parse(file.content);
      } catch (err) {
        diagnostics.push(err);
      }
      luFiles.push({
        diagnostics,
        id: getBaseName(file.name, '.lu'),
        relativePath: file.relativePath,
        content: file.content,
        parsedContent,
      });
    }
  }
  return luFiles;
}

function parse(content: string): Promise<any> {
  const log = false;
  const locale = 'en-us';

  return parser.parseFile(content, log, locale);
}

export const luIndexer = {
  index,
  parse,
};
