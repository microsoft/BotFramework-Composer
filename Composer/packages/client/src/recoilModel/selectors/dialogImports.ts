// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LanguageFileImport, LgFile, LuFile, QnAFile } from '@bfc/shared';
import uniqBy from 'lodash/uniqBy';
import { selectorFamily } from 'recoil';

import { getBaseName } from '../../utils/fileUtil';
import { localeState } from '../atoms';

import { lgFilesSelectorFamily } from './lg';
import { luFilesSelectorFamily } from './lu';

// Finds all the file imports starting from a given dialog file.
export const getLanguageFileImports = <T extends LgFile | LuFile | QnAFile>(
  rootDialogId: string,
  getFile: (fileId: string) => T
): LanguageFileImport[] => {
  const imports: LanguageFileImport[] = [];

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
      // eslint-disable-next-line no-console
      console.warn(`Could not find language import file ${currentId}`);
      continue;
    }
    const currentImports = file.imports.map((item) => {
      const importedFile = getFile(getBaseName(item.id));
      const displayName = item.id.substring(0, item.id.indexOf('.'));
      return {
        displayName,
        importPath: item.path,
        id: importedFile ? importedFile.id : '',
      };
    });

    visitedIds.push(currentId);
    imports.push(...currentImports);
    const newIds = currentImports.map((ci) => getBaseName(ci.id));
    fileIds.push(...newIds);
  }

  return uniqBy(imports, 'id');
};

// Returns all the lg imports referenced by a dialog file and its referenced lg files.
export const lgImportsSelectorFamily = selectorFamily<LanguageFileImport[], { projectId: string; dialogId: string }>({
  key: 'lgImports',
  get: ({ projectId, dialogId }) => ({ get }) => {
    const locale = get(localeState(projectId));

    const getFile = (fileId: string) =>
      get(lgFilesSelectorFamily(projectId)).find((f) => f.id === fileId || f.id === `${fileId}.${locale}`) as LgFile;

    // Have to exclude common as a special case
    return getLanguageFileImports(dialogId, getFile).filter((i) => getBaseName(i.id) !== 'common');
  },
});

// Returns all the lu imports referenced by a dialog file and its referenced lu files.
export const luImportsSelectorFamily = selectorFamily<LanguageFileImport[], { projectId: string; dialogId: string }>({
  key: 'luImports',
  get: ({ projectId, dialogId }) => ({ get }) => {
    const locale = get(localeState(projectId));

    const getFile = (fileId: string) =>
      get(luFilesSelectorFamily(projectId)).find((f) => f.id === fileId || f.id === `${fileId}.${locale}`) as LuFile;

    return getLanguageFileImports(dialogId, getFile);
  },
});
