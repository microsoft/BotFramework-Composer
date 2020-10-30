// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { RecognizerFile } from '@bfc/shared';
import { selectorFamily } from 'recoil';

import { recognizerIdsState, recognizerState } from '../atoms';

export const recognizersSelectorFamily = selectorFamily<RecognizerFile[], string>({
  key: 'recognizers',
  get: (projectId: string) => ({ get }) => {
    const recognizerIds = get(recognizerIdsState(projectId));

    return recognizerIds.map((id) => {
      return get(recognizerState({ projectId, id }));
    });
  },
  set: (projectId: string) => ({ set }, newRecognizers) => {
    const newRecognizerArray = newRecognizers as RecognizerFile[];
    set(
      recognizerIdsState(projectId),
      newRecognizerArray.map((file) => file.id)
    );
    newRecognizerArray.forEach((file) => set(recognizerState({ projectId, id: file.id }), file));
  },
});
