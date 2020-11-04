// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { SDKKinds } from '@bfc/shared';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { recognizerState } from '../atoms';
import { LuisRecognizerTemplate, OrchestratorRecognizerTemplate } from '../Recognizers';

import { recognizersSelectorFamily } from './../selectors/recognizers';

export type RecognizerKindType = SDKKinds.OrchestratorRecognizer | SDKKinds.LuisRecognizer;
const LuProviderRecognizer = [SDKKinds.OrchestratorRecognizer, SDKKinds.LuisRecognizer];

const templates = {
  [SDKKinds.OrchestratorRecognizer]: OrchestratorRecognizerTemplate,
  [SDKKinds.LuisRecognizer]: LuisRecognizerTemplate,
};

export const recognizerDispatcher = () => {
  const updateRecognizer = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => (projectId: string, dialogId: string, kind: RecognizerKindType) => {
      const recognizersLoadable = snapshot.getLoadable(recognizersSelectorFamily(projectId));
      if (recognizersLoadable.state === 'hasValue') {
        const updates = recognizersLoadable.contents.filter(
          ({ id, content }) =>
            id.split('.')[0] === dialogId && LuProviderRecognizer.includes(content.$kind) && content.$kind !== kind
        );

        updates.forEach(({ id }) => {
          set(recognizerState({ projectId, id }), {
            id,
            content: templates[kind](dialogId, id.replace('.lu.dialog', '')),
          });
        });
      }
    }
  );

  return {
    updateRecognizer,
  };
};
