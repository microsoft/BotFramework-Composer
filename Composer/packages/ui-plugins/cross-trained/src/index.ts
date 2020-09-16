// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

const config: PluginConfig = {
  recognizers: [
    {
      id: SDKKinds.CrossTrainedRecognizerSet,
      displayName: formatMessage('Default recognizer'),
      isSelected: (data) => {
        return typeof data === 'string';
      },
      handleRecognizerChange: (props, shellData, _) => {
        const { qnaFiles, luFiles, currentDialog, locale } = shellData;
        const qnaFile = qnaFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);
        const luFile = luFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);

        if (qnaFile && luFile) {
          // strip locale out of id so it doesn't get serialized
          // into the .dialog file
          props.onChange(`${currentDialog.id}.lu.qna`);
        } else {
          alert(formatMessage(`NO LU OR QNA FILE WITH NAME { id }`, { id: currentDialog.id }));
        }
      },
      renameIntent: () => {},
    },
  ],
};

export default config;
