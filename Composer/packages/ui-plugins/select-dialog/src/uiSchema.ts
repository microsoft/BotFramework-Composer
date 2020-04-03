// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { SelectDialog } from './SelectDialog';
import { SelectSkillDialog } from './SelectSkillDialog';

const uiSchema: UISchema = {
  [SDKKinds.BeginDialog]: {
    properties: {
      dialog: {
        field: SelectDialog,
      },
    },
  },
  [SDKKinds.ReplaceDialog]: {
    properties: {
      dialog: {
        field: SelectDialog,
      },
    },
  },
  [SDKKinds.SkillDialog]: {
    hidden: ['botId'],
    properties: {
      skillHostEndpoint: {
        field: SelectSkillDialog,
      },
    },
  },
};

export default uiSchema;
