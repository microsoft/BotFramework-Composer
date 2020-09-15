// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import { RegexIntentField, CustomRecognizerField } from '@bfc/adaptive-form';

export const DefaultRecognizers: RecognizerSchema[] = [
  {
    id: SDKKinds.RegexRecognizer,
    displayName: formatMessage('Regular Expression'),
    intentEditor: RegexIntentField,
    isSelected: (data) => {
      return typeof data === 'object' && data.$kind === SDKKinds.RegexRecognizer;
    },
    renameIntent: (intentName, newIntentName, shellData, shellApi) => {
      const { currentDialog } = shellData;
      shellApi.renameRegExIntent(currentDialog.id, intentName, newIntentName);
    },
  },
  {
    id: SDKKinds.CustomRecognizer,
    displayName: formatMessage('Custom recognizer'),
    isSelected: (data) => typeof data === 'object',
    handleRecognizerChange: (props) =>
      props.onChange({
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
  },
];
