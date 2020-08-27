// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';
import { VisualEditorColors as Colors } from '@bfc/ui-shared';

import { LgField } from './LgField';
import { LgWidget } from './LgWidget';

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.SendActivity]: {
      form: {
        properties: {
          activity: {
            label: 'Language Generation',
            description:
              'What your bot says to the user. This is a template used to create the outgoing message. It can include language generation rules, properties from memory, and other features.\n\nFor example, to define variations that will be chosen at random, write:\n- hello\n- hi',
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
  flowWidgets: {
    LgWidget,
  },
};

export default config;
