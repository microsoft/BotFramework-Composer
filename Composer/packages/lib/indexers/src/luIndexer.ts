// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, LuFile, ILUFeaturesConfig, LUImportResolverDelegate } from '@bfc/shared';
import { sectionHandler } from '@microsoft/bf-lu/lib/parser/composerindex';
import merge from 'lodash/merge';

import { getBaseName } from './utils/help';
import { FileExtensions } from './utils/fileExtensions';
import { convertLuParseResultToLuFile, defaultLUFeatures } from './utils/luUtil';
const { luParser } = sectionHandler;

function parse(
  content: string,
  id = '',
  luFeatures: ILUFeaturesConfig,
  importResolver?: LUImportResolverDelegate
): LuFile {
  const appliedConfig = merge(defaultLUFeatures, luFeatures);
  const result = luParser.parse(content);
  return convertLuParseResultToLuFile(id, result, appliedConfig, importResolver);
}

function index(files: FileInfo[], config: ILUFeaturesConfig, importResolver?: LUImportResolverDelegate): LuFile[] {
  if (files.length === 0) return [];

  const filtered = files.filter((file) => file.name.endsWith(FileExtensions.Lu));

  const luFiles = filtered.map((file) => {
    const { name, content } = file;
    const id = getBaseName(name);
    return parse(content, id, config, importResolver);
  });

  return luFiles;
}

export const luIndexer = {
  index,
  parse,
};
