// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { QnAFile } from '@bfc/shared';
import { selectorFamily } from 'recoil';

import { qnaFileIdsState, qnaFileState } from '../atoms';

export const qnaFilesSelectorFamily = selectorFamily<QnAFile[], string>({
  key: 'qnaFiles',
  get: (projectId: string) => ({ get }) => {
    const qnaFileIds = get(qnaFileIdsState(projectId));

    return qnaFileIds.map((qnaFileId) => {
      return get(qnaFileState({ projectId, qnaFileId }));
    });
  },
  set: (projectId: string) => ({ set }, newQnAFiles) => {
    const newQnAFileArray = newQnAFiles as QnAFile[];

    set(
      qnaFileIdsState(projectId),
      newQnAFileArray.map((qnaFile) => qnaFile.id)
    );
    newQnAFileArray.forEach((qnaFile) => set(qnaFileState({ projectId, qnaFileId: qnaFile.id }), qnaFile));
  },
});
