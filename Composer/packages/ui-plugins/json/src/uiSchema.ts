// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { JsonEditor } from './JsonEditor';
import { LgEditor } from './LgEditor';

const uiSchema: UISchema = {
  [SDKTypes.HttpRequest]: {
    properties: {
      body: {
        'ui:field': JsonEditor,
      },
    },
  },
  [SDKTypes.TextInput]: {
    properties: {
      prompt: {
        'ui:field': LgEditor,
      },
    },
  },
};

export default uiSchema;
