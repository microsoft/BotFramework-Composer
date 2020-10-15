// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerUISchema, FallbackRecognizerKey, RecognizerOptions } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import { RegexIntentField, CustomRecognizerField } from '@bfc/adaptive-form';

const FallbackRecognizerJsonEditor: RecognizerOptions = {
  displayName: () => formatMessage('Custom recognizer'),
  seedNewRecognizer: () => ({}),
  recognizerEditor: CustomRecognizerField,
};

export const DefaultRecognizerSchema: RecognizerUISchema = {
  [SDKKinds.RegexRecognizer]: {
    displayName: () => formatMessage('Regular expression recognizer'),
    intentEditor: RegexIntentField,
    renameIntent: (intentName, newIntentName, shellData, shellApi) => {
      const { currentDialog } = shellData;
      shellApi.renameRegExIntent(currentDialog.id, intentName, newIntentName);
    },
  },
  [FallbackRecognizerKey as SDKKinds]: FallbackRecognizerJsonEditor,
};
