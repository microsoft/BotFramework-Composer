// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';
import { SDKKinds, DialogInfo } from '@bfc/shared';
import formatMessage from 'format-message';

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.OrchestratorRecognizer]: {
      recognizer: {
        displayName: () => formatMessage('Orchestrator Recognizer'),
        isSelected: (_, dialog: DialogInfo) => {
          return dialog.luProvider === SDKKinds.OrchestratorRecognizer;
        },
        intentEditor: 'LuIntentEditor',
        seedNewRecognizer: (shellData, shellApi) => {
          const { qnaFiles, luFiles, currentDialog, locale, projectId } = shellData;
          const qnaFile = qnaFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);
          const luFile = luFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);

          if (!qnaFile || !luFile) {
            alert(formatMessage(`NO LU OR QNA FILE WITH NAME { id }`, { id: currentDialog.id }));
          }

          if (luFile?.empty) {
            alert(formatMessage(`LU FILE IS EMPTY WITH NAME { id }`, { id: currentDialog.id }));
          }

          shellApi.updateRecognizer(projectId, currentDialog.id, SDKKinds.OrchestratorRecognizer);
          return `${currentDialog.id}.lu.qna`;
        },
      },
    },
  },
};

export default config;
