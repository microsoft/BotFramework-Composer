// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';

import { BeginSkillDialogField } from './BeginSkillDialogField';
import { SkillEndpointField } from './SkillEndpointField';

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.BeginSkill]: {
      form: {
        order: ['skillAppId', 'skillEndpoint', 'skillAppId', '*', 'resultProperty', 'activityProcessed'],
        hidden: ['botId', 'skillAppId', 'skillHostEndpoint'],
        field: BeginSkillDialogField,
        properties: {
          skillEndpoint: {
            field: SkillEndpointField,
          },
        },
      },
    },
  },
};

export default config;
