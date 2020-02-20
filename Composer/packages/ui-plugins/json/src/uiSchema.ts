// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { JsonField } from './JsonField';

const uiSchema: UISchema = {
  [SDKTypes.HttpRequest]: {
    properties: {
      body: {
        'ui:field': JsonField,
      },
    },
  },
};

export default uiSchema;
