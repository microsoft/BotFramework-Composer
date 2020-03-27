// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { LgField } from './LgField';

const config: PluginConfig = {
  uiSchema: {
    [SDKTypes.SendActivity]: {
      properties: {
        activity: {
          label: 'Language Generation',
          description:
            'What your bot says to the user. This is a template used to create the outgoing message. It can include language generation rules, properties from memory, and other features.\n\nFor example, to define variations that will be chosen at random, write:\n- hello\n- hi',
          helpLink: 'https://aka.ms/lg-file-format',
        },
      },
    },
    [SDKTypes.IActivityTemplate]: {
      field: LgField,
    },
  },
};

export default config;
