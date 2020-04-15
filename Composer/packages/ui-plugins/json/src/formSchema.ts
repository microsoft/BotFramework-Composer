// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { JsonField } from './JsonField';

const formSchema: UISchema = {
  [SDKKinds.HttpRequest]: {
    properties: {
      body: {
        field: JsonField,
      },
    },
  },
};

export default formSchema;
