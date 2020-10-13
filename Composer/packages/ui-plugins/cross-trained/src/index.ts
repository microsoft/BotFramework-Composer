// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.CrossTrainedRecognizerSet]: {
      recognizer: {
        displayName: () => formatMessage('Default recognizer'),
        isSelected: (data) => {
          return typeof data === 'string' && data.endsWith('.lu.qna');
        },
        intentEditor: 'LuIntentEditor',
        seedNewRecognizer: (shellData) => {
          const { qnaFiles, luFiles, currentDialog, locale } = shellData;
          const qnaFile = qnaFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);
          const luFile = luFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);

          if (!qnaFile || !luFile) {
            alert(formatMessage(`NO LU OR QNA FILE WITH NAME { id }`, { id: currentDialog.id }));
          }

          return `${currentDialog.id}.lu.qna`;
        },
      },
    },
  },
};

export default config;
