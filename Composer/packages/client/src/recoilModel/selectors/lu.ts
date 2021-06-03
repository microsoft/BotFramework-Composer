// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuFile } from '@bfc/shared';
import { selectorFamily, DefaultValue } from 'recoil';

import { luFileIdsState, luFileState } from '../atoms';

export const luFilesSelectorFamily = selectorFamily<LuFile[], string>({
  key: 'luFiles',
  get: (projectId: string) => ({ get }) => {
    const luFileIds = get(luFileIdsState(projectId));

    return luFileIds.map((luFileId) => {
      return get(luFileState({ projectId, luFileId }));
    });
  },
  set: (projectId: string) => ({ set }, newLuFiles: LuFile[] | DefaultValue) => {
    if (newLuFiles instanceof DefaultValue) return;
    set(
      luFileIdsState(projectId),
      newLuFiles.map((luFile) => luFile.id)
    );
    newLuFiles.forEach((luFile) => set(luFileState({ projectId, luFileId: luFile.id }), luFile));
  },
});
