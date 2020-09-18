// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerUISchema, FallbackRecognizerKey, RecognizerOptions } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import { RegexIntentField, CustomRecognizerField } from '@bfc/adaptive-form';

const FallbackRecognizerJsonEditor: RecognizerOptions = {
  displayName: formatMessage('Custom recognizer'),
  seedNewRecognizer: () => ({
    $kind: 'Microsoft.MultiLanguageRecognizer',
    recognizers: {
      'en-us': {
        $kind: 'Microsoft.RegexRecognizer',
        intents: [
          {
            intent: 'greeting',
            pattern: 'hello',
          },
          {
            intent: 'test',
            pattern: 'test',
          },
        ],
      },
      'zh-cn': {
        $kind: 'Microsoft.RegexRecognizer',
        intents: [
          {
            intent: 'greeting',
            pattern: '你好',
          },
          {
            intent: 'test',
            pattern: '测试',
          },
        ],
      },
    },
  }),
  recognizerEditor: CustomRecognizerField,
};

export const DefaultRecognizerSchema: RecognizerUISchema = {
  [SDKKinds.RegexRecognizer]: {
    displayName: formatMessage('Regular Expression'),
    intentEditor: RegexIntentField,
    renameIntent: (intentName, newIntentName, shellData, shellApi) => {
      const { currentDialog } = shellData;
      shellApi.renameRegExIntent(currentDialog.id, intentName, newIntentName);
    },
  },
  [FallbackRecognizerKey as SDKKinds]: FallbackRecognizerJsonEditor,
};
