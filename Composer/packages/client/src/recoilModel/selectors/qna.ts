// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { QnAFile } from '@bfc/shared';
import { DefaultValue, selectorFamily } from 'recoil';

import { qnaFileIdsState, qnaFileState } from '../atoms';

export const qnaFilesSelectorFamily = selectorFamily<QnAFile[], string>({
  key: 'qnaFiles',
  get: (projectId: string) => ({ get }) => {
    const qnaFileIds = get(qnaFileIdsState(projectId));

    return qnaFileIds.map((qnaFileId) => {
      return get(qnaFileState({ projectId, qnaFileId }));
    });
  },
  set: (projectId: string) => ({ set }, newQnaFiles: QnAFile[] | DefaultValue) => {
    if (newQnaFiles instanceof DefaultValue) return;

    set(
      qnaFileIdsState(projectId),
      newQnaFiles.map((qnaFile) => qnaFile.id)
    );
    newQnaFiles.forEach((qnaFile) => set(qnaFileState({ projectId, qnaFileId: qnaFile.id }), qnaFile));
  },
});
