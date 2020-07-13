// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FormUISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { SelectDialog } from './SelectDialog';

const formSchema: FormUISchema = {
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
