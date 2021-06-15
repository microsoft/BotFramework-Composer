// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { SDKKinds } from '@bfc/shared';
import { LuProviderType } from '@botframework-composer/types';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { recognizerState } from '../atoms';
import { LuisRecognizerTemplate, OrchestratorRecognizerTemplate } from '../Recognizers';

import { recognizersSelectorFamily } from './../selectors/recognizers';

const LuProviderRecognizer = [SDKKinds.OrchestratorRecognizer, SDKKinds.LuisRecognizer];

const templates = {
  [SDKKinds.OrchestratorRecognizer]: OrchestratorRecognizerTemplate,
  [SDKKinds.LuisRecognizer]: LuisRecognizerTemplate,
};

export const recognizerDispatcher = () => {
  const updateRecognizer = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (projectId: string, dialogId: string, kind: LuProviderType) => {
      const recognizers = await snapshot.getPromise(recognizersSelectorFamily(projectId));

      const updates = recognizers.filter(
        ({ id, content }) =>
          id.split('.')[0] === dialogId && LuProviderRecognizer.includes(content.$kind) && content.$kind !== kind
      );

      const mutlilangRecognizer = recognizers.find(
        ({ id, content }) => id.split('.')[0] === dialogId && content.$kind === SDKKinds.MultiLanguageRecognizer
      );

      if (mutlilangRecognizer) {
        const { id, content } = mutlilangRecognizer;
        const key = kind === SDKKinds.OrchestratorRecognizer ? 'ORCHESTRATOR' : 'LUIS';
        set(recognizerState({ projectId, id }), {
          content: { ...content, id: `${key}_${id.replace('.lu.dialog', '')}` },
          id,
        });
      }

      updates.forEach(({ id }) => {
        set(recognizerState({ projectId, id }), {
          id,
          content: templates[kind](dialogId, id.replace('.lu.dialog', '')),
        });
      });
    }
  );

  return {
    updateRecognizer,
  };
};
