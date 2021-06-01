// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';
import { SDKKinds, DialogInfo, checkForPVASchema } from '@bfc/shared';
import formatMessage from 'format-message';

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.CrossTrainedRecognizerSet]: {
      recognizer: {
        displayName: () => formatMessage('Default recognizer'),
        description: () =>
          formatMessage(
            'Gives your bot the ability to extract intent and entity data from an utterance based on a cross trained recognizer set.'
          ),
        isSelected: (data, dialog: DialogInfo) => {
          if (dialog.luProvider === SDKKinds.OrchestratorRecognizer) return false;
          return typeof data === 'string' && data.endsWith('.lu.qna');
        },
        intentEditor: 'LuIntentEditor',
        seedNewRecognizer: (shellData, shellApi) => {
          const { qnaFiles, luFiles, currentDialog, locale, projectId, schemas } = shellData;
          const qnaFile = qnaFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);
          const luFile = luFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);

          if (!luFile) {
            alert(formatMessage(`NO LU FILE WITH NAME { id }`, { id: currentDialog.id }));
          }

          if (!qnaFile && !checkForPVASchema(schemas.sdk)) {
            alert(formatMessage(`NO QNA FILE WITH NAME { id }`, { id: currentDialog.id }));
          }

          shellApi.updateRecognizer(projectId, currentDialog.id, SDKKinds.LuisRecognizer);

          return `${currentDialog.id}.lu.qna`;
        },
      },
    },
  },
};

export default config;
