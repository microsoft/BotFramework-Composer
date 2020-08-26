// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

const config: PluginConfig = {
  recognizers: [
    {
      id: SDKKinds.CrossTrainedRecognizerSet,
      displayName: 'Default recognizer',
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
          alert(`NO LU OR QNA FILE WITH NAME ${currentDialog.id}`);
        }
      },
      renameIntent: () => {},
    },
  ],
};

export default config;
