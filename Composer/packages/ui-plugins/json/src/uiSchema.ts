// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { JsonField } from './JsonField';

const uiSchema: UISchema = {
  [SDKKinds.HttpRequest]: {
    properties: {
      body: {
        field: JsonField,
      },
    },
  },
};

export default uiSchema;
