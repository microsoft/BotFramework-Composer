// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { SelectDialog } from './SelectDialog';

const formSchema: UISchema = {
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
};

export default formSchema;
