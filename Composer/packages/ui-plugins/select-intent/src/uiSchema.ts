// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { SelectIntent } from './SelectIntent';

const uiSchema: UISchema = {
  [SDKTypes.OnIntent]: {
    properties: {
      intent: {
        field: SelectIntent,
      },
    },
  },
};

export default uiSchema;
