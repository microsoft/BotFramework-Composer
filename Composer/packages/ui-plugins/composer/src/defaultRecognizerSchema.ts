// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerUISchema, FallbackRecognizerKey, RecognizerOptions } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import { RegexIntentField, CustomRecognizerField } from '@bfc/adaptive-form';

const FallbackRecognizerJsonEditor: RecognizerOptions = {
  displayName: () => formatMessage('Custom'),
  seedNewRecognizer: () => ({}),
  recognizerEditor: CustomRecognizerField,
  description: () => formatMessage('Enables you to customize your own recognizer by editing JSON in the form'),
};

export const DefaultRecognizerSchema: RecognizerUISchema = {
  [SDKKinds.RegexRecognizer]: {
    displayName: () => formatMessage('Regular expression'),
    description: () =>
      formatMessage(
        'Gives your bot the ability to extract intent and entity data from an utterance based on regular expression patterns.'
      ),
    intentEditor: RegexIntentField,
    renameIntent: (intentName, newIntentName, shellData, shellApi) => {
      const { currentDialog } = shellData;
      shellApi.renameRegExIntent(currentDialog.id, intentName, newIntentName);
    },
  },
  [FallbackRecognizerKey as SDKKinds]: FallbackRecognizerJsonEditor,
};
