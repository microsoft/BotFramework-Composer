// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuFile } from '@bfc/shared';
import { selectorFamily } from 'recoil';

import { luFileIdsState, luFileState } from '../atoms';

export const luFilesSelectorFamily = selectorFamily<LuFile[], string>({
  key: 'luFiles',
  get: (projectId: string) => ({ get }) => {
    const luFileIds = get(luFileIdsState(projectId));

    return luFileIds.map((luFileId) => {
      return get(luFileState({ projectId, luFileId }));
    });
  },
  set: (projectId: string) => ({ set }, newLuFiles) => {
    const newLuFileArray = newLuFiles as LuFile[];

    set(
      luFileIdsState(projectId),
      newLuFileArray.map((luFile) => luFile.id)
    );
    newLuFileArray.forEach((luFile) => set(luFileState({ projectId, luFileId: luFile.id }), luFile));
  },
});
