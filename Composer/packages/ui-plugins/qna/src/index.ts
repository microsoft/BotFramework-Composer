// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { QnaIntentEditor } from './QnaIntentEditor';

const config: PluginConfig = {
  recognizers: [
    {
      id: SDKKinds.QnaRecognizer,
      displayName: 'QNA',
      editor: QnaIntentEditor,
      isSelected: data => {
        return typeof data === 'string' && data.endsWith('.qna');
      },
      handleRecognizerChange: (props, shellData, _, fallback) => {
        const { qnaFiles, currentDialog, locale } = shellData;
        const qnaFile = qnaFiles.find(f => f.id === `${currentDialog.id}.${locale}`);

        if (qnaFile) {
          // strip locale out of id so it doesn't get serialized
          // into the .dialog file
          fallback(`${qnaFile.id.split('.')[0]}.qna`);
        } else {
          alert(`NO QNA FILE WITH NAME ${currentDialog.id}`);
        }
      },
    },
  ],
};

export default config;
