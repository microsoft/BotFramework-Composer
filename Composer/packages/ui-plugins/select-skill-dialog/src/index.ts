// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import formatMessage from 'format-message';
import { SDKKinds } from '@bfc/shared';

import { SelectSkillDialog } from './SelectSkillDialogField';
import { BeginSkillDialogField } from './BeginSkillDialogField';

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.BeginSkill]: {
      form: {
        order: ['skillAppId', '*', 'resultProperty', 'disabled', 'activityProcessed'],
        hidden: ['botId', 'skillEndpoint', 'skillAppId', 'skillHostEndpoint'],
        field: BeginSkillDialogField,
        properties: {
          id: {
            description: () => formatMessage('Name of skill dialog to call'),
            label: () => formatMessage('Skill Dialog Name'),
            field: SelectSkillDialog,
          },
        },
      },
    },
  },
};

export default config;
