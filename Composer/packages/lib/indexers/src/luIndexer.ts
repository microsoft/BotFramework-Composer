// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, LuFile, ILUFeaturesConfig } from '@bfc/shared';

import { getBaseName } from './utils/help';
import { FileExtensions } from './utils/fileExtensions';
import * as luUtil from './utils/luUtil';

function parse(content: string, id = '', config: ILUFeaturesConfig): LuFile {
  return luUtil.parse(id, content, config);
}

function index(files: FileInfo[], config: ILUFeaturesConfig): LuFile[] {
  if (files.length === 0) return [];

  const filtered = files.filter((file) => file.name.endsWith(FileExtensions.Lu));

  const luFiles = filtered.map((file) => {
    const { name, content } = file;
    const id = getBaseName(name);
    return parse(content, id, config);
  });

  return luFiles;
}

export const luIndexer = {
  index,
  parse,
};
