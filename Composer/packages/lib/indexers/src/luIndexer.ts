// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { sectionHandler } from '@microsoft/bf-lu/lib/parser/composerindex';
import { FileInfo, LuFile } from '@bfc/shared';

import { getBaseName } from './utils/help';
import { FileExtensions } from './utils/fileExtensions';
import { convertLuParseResultToLuFile } from './utils/luUtil';

const { luParser } = sectionHandler;

function parse(content: string, id = ''): LuFile {
  const result = luParser.parse(content);
  return convertLuParseResultToLuFile(id, result);
}

function index(files: FileInfo[]): LuFile[] {
  if (files.length === 0) return [];

  const filtered = files.filter((file) => file.name.endsWith(FileExtensions.Lu));

  const luFiles = filtered.map((file) => {
    const { name, content } = file;
    const id = getBaseName(name);
    return parse(content, id);
  });

  return luFiles;
}

export const luIndexer = {
  index,
  parse,
};
