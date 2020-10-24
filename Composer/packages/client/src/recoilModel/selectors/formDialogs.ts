// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ImportExpression, LgFile, LuFile } from '@bfc/shared';
import uniqBy from 'lodash/uniqBy';
import { selectorFamily } from 'recoil';

import { getBaseName } from '../../utils/fileUtil';
import { localeState, lgFilesState, luFilesState } from '../atoms';

// eslint-disable-next-line security/detect-unsafe-regex
const importRegex = /\[(?<id>.*?)]\((?<importPath>.*?)(?="|\))(?<optionalpart>".*")?\)/g;

const getImportsHelper = (content: string): ImportExpression[] => {
  const lines = content.split(/\r?\n/g).filter((l) => !!l) ?? [];

  return (lines
    .map((l) => {
      importRegex.lastIndex = 0;
      return importRegex.exec(l) as RegExpExecArray;
    })
    .filter(Boolean) as RegExpExecArray[]).map((regExecArr) => ({
    id: getBaseName(regExecArr.groups?.id ?? ''),
    importPath: regExecArr.groups?.importPath ?? '',
  }));
};

// Finds all the file imports starting from a given dialog file.
const getImports = <T extends { content: string }>(rootDialogId: string, getFile: (fileId: string) => T): T[] => {
  const imports: ImportExpression[] = [];

  const visitedIds: string[] = [];
  const fileIds = [rootDialogId];

  while (fileIds.length) {
    const currentId = fileIds.pop() as string;
    // If this file is already visited, then continue.
    if (visitedIds.includes(currentId)) {
      continue;
    }
    const file = getFile(currentId);
    // If file is not found or file content is empty, then continue.
    if (!file || !file.content) {
      continue;
    }
    const currentImports = getImportsHelper(file.content);
    visitedIds.push(currentId);
    imports.push(...currentImports);
    const newIds = currentImports.map((ci) => getBaseName(ci.id));
    fileIds.push(...newIds);
  }

  return uniqBy(imports, 'id').map((impExpr) => getFile(impExpr.id));
};

// Returns all the lg files referenced by a dialog file and its referenced lg files.
export const lgImportsSelectorFamily = selectorFamily<LgFile[], { projectId: string; dialogId: string }>({
  key: 'lgImports',
  get: ({ projectId, dialogId }) => ({ get }) => {
    const locale = get(localeState(projectId));

    const getFile = (fileId: string) =>
      get(lgFilesState(projectId)).find((f) => f.id === fileId || f.id === `${fileId}.${locale}`) as LgFile;

    return getImports(dialogId, getFile);
  },
});

// Returns all the lu files referenced by a dialog file and its referenced lu files.
export const luImportsSelectorFamily = selectorFamily<LuFile[], { projectId: string; dialogId: string }>({
  key: 'luImports',
  get: ({ projectId, dialogId }) => ({ get }) => {
    const locale = get(localeState(projectId));

    const getFile = (fileId: string) =>
      get(luFilesState(projectId)).find((f) => f.id === fileId || f.id === `${fileId}.${locale}`) as LuFile;

    return getImports(dialogId, getFile);
  },
});
