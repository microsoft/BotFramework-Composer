// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, ResolverResource } from '@bfc/shared';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const luObject = require('@bfcomposer/bf-lu/lib/parser/lu/lu.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const luOptions = require('@bfcomposer/bf-lu/lib/parser/lu/luOptions.js');

function getFileName(path: string): string {
  return path.split('/').pop() || path;
}
function getBaseName(filename?: string): string | any {
  if (typeof filename !== 'string') return filename;
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

export function fileInfoToResources(files: FileInfo[]): ResolverResource[] {
  return files.map((file) => {
    return {
      id: getBaseName(file.name),
      content: file.content,
    };
  });
}

export function luImportResolverGenerator(files: ResolverResource[]) {
  /**
   *  @param srcId current file id
   *  @param idsToFind imported file id
   *  for example:
   *  in todosample.en-us.lu:
   *   [help](help.lu)
   *
   *  would resolve to help.en-us.lu || help.lu
   *
   *  sourceId =  todosample.en-us.lu
   *  idsToFind =   [{ filePath: help.lu, includeInCollate: true}, ...]
   *
   *  Overlap implemented built-in fs resolver in
   *  botframework-cli/packages/lu/src/parser/lu/luMerger.js#findLuFilesInDir
   *  Diffrence is composer support import by id, but not support * / ** file match
   */
  return (srcId: string, idsToFind: any[]) => {
    const ext = '.lu';
    // eslint-disable-next-line security/detect-non-literal-regexp
    const extReg = new RegExp(ext + '$');
    const sourceId = getFileName(srcId).replace(extReg, '');
    const locale = /\w\.\w/.test(sourceId) ? sourceId.split('.').pop() : 'en-us';

    const luObjects = idsToFind.map((file) => {
      const fileId = file.filePath;
      const targetId = getFileName(fileId).replace(extReg, '');

      const targetFile =
        files.find(({ id }) => id === `${targetId}.${locale}`) || files.find(({ id }) => id === `${targetId}`);

      if (!targetFile) throw new Error(`File: ${file.filePath} not found`);

      const options = new luOptions(targetId, file.includeInCollate, locale);
      return new luObject(targetFile.content, options);
    });

    return luObjects;
  };
}
