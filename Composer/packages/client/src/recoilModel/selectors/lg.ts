// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgFile } from '@bfc/shared';
import { selectorFamily } from 'recoil';

import { lgFileIdsState, lgFileState } from '../atoms';

export const lgFilesSelectorFamily = selectorFamily<LgFile[], string>({
  key: 'lgFiles',
  get: (projectId: string) => ({ get }) => {
    const lgFileIds = get(lgFileIdsState(projectId));

    return lgFileIds.map((lgFileId) => {
      return get(lgFileState({ projectId, lgFileId }));
    });
  },
  set: (projectId: string) => ({ set, get }, newLgFiles) => {
    const newLgFileArray = newLgFiles as LgFile[];
    set(
      lgFileIdsState(projectId),
      newLgFileArray.map((lgFile) => lgFile.id)
    );
    newLgFileArray.forEach((lgFile) => set(lgFileState({ projectId, lgFileId: lgFile.id }), lgFile));
  },
});
