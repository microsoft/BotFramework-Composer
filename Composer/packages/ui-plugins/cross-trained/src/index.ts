// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

const config: PluginConfig = {
  recognizers: [
    {
      id: SDKKinds.CrossTrainedRecognizerSet,
      displayName: 'Luis + QnA',
      isSelected: (data) => {
        return typeof data === 'object' && data.$kind === SDKKinds.CrossTrainedRecognizerSet;
      },
      handleRecognizerChange: (props, shellData, _) => {
        const { qnaFiles, luFiles, currentDialog, locale } = shellData;
        const qnaFile = qnaFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);
        const luFile = luFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);

        if (qnaFile && luFile) {
          // strip locale out of id so it doesn't get serialized
          // into the .dialog file
          props.onChange({
            $kind: SDKKinds.CrossTrainedRecognizerSet,
            recognizers: [`${luFile.id.split('.')[0]}.lu`, `${qnaFile.id.split('.')[0]}.qna`],
          });
        } else {
          alert(`NO LU OR QNA FILE WITH NAME ${currentDialog.id}`);
        }
      },
    },
  ],
};

export default config;
