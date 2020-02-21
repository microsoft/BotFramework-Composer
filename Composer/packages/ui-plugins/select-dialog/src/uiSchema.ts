// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { SelectDialog } from './SelectDialog';

const uiSchema: UISchema = {
  [SDKTypes.BeginDialog]: {
    properties: {
      dialog: {
        field: SelectDialog,
      },
    },
  },
  [SDKTypes.ReplaceDialog]: {
    properties: {
      dialog: {
        field: SelectDialog,
      },
    },
  },
};

export default uiSchema;
