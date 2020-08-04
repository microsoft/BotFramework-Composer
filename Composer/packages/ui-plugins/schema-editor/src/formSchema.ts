// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { AdaptiveDialogField } from './Fields/AdaptiveDialogField';

const uiSchema: UISchema = {
  [SDKKinds.AdaptiveDialog]: {
    form: {
      field: AdaptiveDialogField,
    },
  },
};

export default uiSchema;
