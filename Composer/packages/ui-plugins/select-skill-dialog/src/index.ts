// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

import { SelectSkillDialogField } from './SelectSkillDialogField';
import { SkillEndpointField } from './SkillEndpointField';

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.BeginSkill]: {
      form: {
        additionalFields: [
          {
            field: SelectSkillDialogField,
            name: 'selectSkillDialog',
            label: formatMessage('Skill Dialog Name'),
            description: formatMessage('Name of skill dialog to call'),
          },
          {
            field: SkillEndpointField,
            name: 'selectSkillEndpoint',
            label: formatMessage('Skill Endpoint'),
            description: formatMessage('The /api/messages endpoint for the skill.'),
          },
        ],
        order: ['selectSkillDialog', 'selectSkillEndpoint', '*', 'resultProperty', 'activityProcessed'],
        hidden: ['skillEndpoint', 'botId', 'skillAppId', 'skillHostEndpoint'],
      },
    },
  },
};

export default config;
