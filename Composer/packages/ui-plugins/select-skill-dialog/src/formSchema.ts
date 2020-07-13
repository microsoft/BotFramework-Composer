// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { FormUISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { BeginSkillDialogField } from './BeginSkillDialogField';
import { SelectSkillDialog } from './SelectSkillDialogField';

const formSchema: FormUISchema = {
  [SDKKinds.BeginSkill]: {
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
};

export default formSchema;
