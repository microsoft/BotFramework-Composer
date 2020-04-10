// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { UISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { BeginSkillDialogField } from './BeginSkillDialogField';
import { SelectSkillDialog } from './SelectSkillDialogField';

const uiSchema: UISchema = {
  [SDKKinds.SkillDialog]: {
    order: ['skillAppId', '*', 'resultProperty', 'disabled', 'activityProcessed'],
    hidden: ['skillEndpoint'],
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

export default uiSchema;
