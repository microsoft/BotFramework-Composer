// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import { VisualEditorColors as Colors } from '@bfc/ui-shared';
import formatMessage from 'format-message';

import { LgField } from './LgField';
import { LgWidget } from './LgWidget';

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.SendActivity]: {
      form: {
        properties: {
          activity: {
            label: formatMessage('Language Generation'),
            description: formatMessage(
              'Language Generation enables bots to respond to users with human readable language.'
            ),
            helpLink: 'https://aka.ms/lg-file-format',
          },
        },
      },
      flow: {
        widget: 'ActionCard',
        header: {
          widget: 'ActionHeader',
          icon: 'MessageBot',
          colors: {
            theme: Colors.BlueMagenta20,
            icon: Colors.BlueMagenta30,
          },
        },
        body: {
          widget: 'LgWidget',
          field: 'activity',
        },
      },
    },
    [SDKKinds.UpdateActivity]: {
      flow: {
        widget: 'ActionCard',
        header: {
          widget: 'ActionHeader',
          icon: 'MessageBot',
          colors: {
            theme: Colors.AzureGray3,
            icon: Colors.AzureGray2,
          },
        },
        body: {
          widget: 'LgWidget',
          field: 'activity',
        },
      },
    },
    [SDKKinds.IActivityTemplate]: {
      form: {
        field: LgField,
      },
    },
  },
  widgets: {
    flow: {
      LgWidget,
    },
  },
};

export default config;
