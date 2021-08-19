// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

import { LuisIntentEditor as LuIntentEditor } from './LuisIntentEditor';
import { TriggerWidget } from './TriggerWidget';
import { SetPropertyWidget } from './SetPropertyWidget';

const config: PluginConfig = {
  widgets: {
    recognizer: {
      LuIntentEditor,
    },
    flow: {
      TriggerWidget,
      SetPropertyWidget,
    },
  },
  uiSchema: {
    [SDKKinds.LuisRecognizer]: {
      recognizer: {
        disabled: true,
        displayName: () => formatMessage('LUIS'),
        description: () =>
          formatMessage(
            'Gives your bot the ability to extract intent and entity data from an utterance based on luis modal'
          ),
        intentEditor: 'LuIntentEditor',
        isSelected: (data) => {
          return typeof data === 'string' && data.endsWith('.lu');
        },
        seedNewRecognizer: (shellData) => {
          const { luFiles, currentDialog, locale } = shellData;
          const luFile = luFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);

          if (!luFile) {
            alert(formatMessage(`NO LU FILE WITH NAME {id}`, { id: currentDialog.id }));
            return '';
          }

          try {
            return `${luFile.id.split('.')[0]}.lu`;
          } catch (err) {
            return '';
          }
        },
        renameIntent: async (intentName, newIntentName, shellData, shellApi) => {
          const { currentDialog, locale } = shellData;
          shellApi.updateIntentTrigger(currentDialog.id, intentName, newIntentName);
          await shellApi.renameLuIntent(`${currentDialog.id}.${locale}`, intentName, newIntentName);
        },
      },
    },
    [SDKKinds.OnIntent]: {
      flow: {
        widget: 'ActionCard',
        header: {
          colors: {
            theme: '#E7F4F4',
          },
          widget: 'ActionHeader',
        },
        body: {
          widget: 'TriggerWidget',
        },
      },
    },
  },
};

export default config;
