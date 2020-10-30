// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { recognizerState } from '../atoms';

export const recognizerDispatcher = () => {
  const updateRecognizer = useRecoilCallback(
    ({ set }: CallbackInterface) => async (projectId: string, recognizerId: string, content: any) => {
      set(recognizerState({ projectId, id: recognizerId }), content);
    }
  );

  return {
    updateRecognizer,
  };
};
