// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { AdaptiveDialogField } from './AdaptiveDialogField';

const formSchema: UISchema = {
  [SDKKinds.AdaptiveDialog]: {
    field: AdaptiveDialogField,
  },
};

export default formSchema;
