// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@botframework-composer/types';
import multimatch from 'multimatch';

import { Path } from './path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const luObject = require('@microsoft/bf-lu/lib/parser/lu/lu.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const luOptions = require('@microsoft/bf-lu/lib/parser/lu/luOptions.js');

function isWildcardPattern(str: string): boolean {
  return str.endsWith('/*') || str.endsWith('/**');
}

function isURIContainsPath(str: string): boolean {
  return str.startsWith('/') || str.startsWith('./') || str.startsWith('../');
}

function globMatch(files: FileInfo[], sourceFileDir: string, targetPath: string): FileInfo[] {
  const targetFullPath = Path.resolve(sourceFileDir, targetPath);

  return files.filter((item) => {
    const match = multimatch([item.path], targetFullPath);
    return match.length;
  });
}

export function getLUFiles(files: FileInfo[]): FileInfo[] {
  return files.filter(({ name }) => name.endsWith('.lu'));
}

export function getQnAFiles(files: FileInfo[]): FileInfo[] {
  return files.filter(({ name }) => name.endsWith('.qna'));
}

export function luImportResolverGenerator(files: FileInfo[]) {
  /**
   *  @param srcId current <file path> file id
   *  @param idsToFind imported <file path> file id
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
   *  Not only by path, composer also support import by id and without locale
   */

  /**
   * common.lu#Help
   * common.lu#*utterances*
   * common.lu#*patterns*
   */
  const fragmentReg = new RegExp('#.*$');

  return (srcId: string, idsToFind: any[]) => {
    const ext = Path.extname(srcId);
    // eslint-disable-next-line security/detect-non-literal-regexp
    const extReg = new RegExp(ext + '$');

    const sourceId = Path.basename(srcId).replace(extReg, '');
    const locale = /\w\.\w/.test(sourceId) ? sourceId.split('.').pop() : 'en-us';

    const sourceFile =
      files.find(({ name }) => name === `${sourceId}.${locale}${ext}`) ||
      files.find(({ name }) => name === `${sourceId}${ext}`);

    if (!sourceFile) throw new Error(`Resolve file: ${srcId} not found`);
    const sourceFileDir = Path.dirname(sourceFile.path);

    const wildcardIds = idsToFind.filter((item) => isWildcardPattern(item.filePath));
    const fileIds = idsToFind.filter((item) => !isWildcardPattern(item.filePath));

    const luObjectFromWildCardIds = wildcardIds.reduce((prev, file) => {
      const targetPath = file.filePath;
      const referdFiles = globMatch(files, sourceFileDir, targetPath);

      const luObjects = referdFiles.map((item) => {
        const options = new luOptions(item.path, file.includeInCollate, locale);
        return new luObject(item.content, options);
      });

      return prev.concat(luObjects);
    }, []);

    const luObjects = fileIds.map((file) => {
      const targetPath = file.filePath;
      const targetId = Path.basename(targetPath).replace(fragmentReg, '').replace(extReg, '');

      let targetFile: FileInfo | undefined;
      if (isURIContainsPath(targetPath)) {
        // by path
        const targetFullPath = Path.resolve(sourceFileDir, targetPath.replace(fragmentReg, ''));
        const targetFullPath2 = Path.resolve(
          sourceFileDir,
          targetPath.replace(fragmentReg, '').replace(extReg, `.${locale}${ext}`)
        );
        targetFile =
          files.find(({ path }) => path === targetFullPath) || files.find(({ path }) => path === targetFullPath2);
      } else {
        // by id
        targetFile =
          files.find(({ name }) => name === `${targetId}.${locale}${ext}`) ||
          files.find(({ name }) => name === `${targetId}${ext}`);
      }

      if (!targetFile) throw new Error(`File: ${file.filePath} not found`);

      // lubuild use targetId index all luObjects, it should be uniq for each lu file.
      // absolute file path is an idea identifier.
      const options = new luOptions(targetFile.path, file.includeInCollate, locale);
      return new luObject(targetFile.content, options);
    });
    return luObjects.concat(luObjectFromWildCardIds).filter((obj) => obj.content);
  };
}
