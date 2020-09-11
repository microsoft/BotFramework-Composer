// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';

import { BeginSkillDialogField } from './BeginSkillDialogField';

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.BeginSkill]: {
      form: {
        order: ['skillAppId', '*', 'resultProperty', 'disabled', 'activityProcessed'],
        hidden: ['botId', 'skillEndpoint', 'skillAppId', 'skillHostEndpoint'],
        field: BeginSkillDialogField,
      },
    },
  },
};

export default config;
