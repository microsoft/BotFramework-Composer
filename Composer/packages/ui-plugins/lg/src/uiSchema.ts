// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';

import { LgField } from './LgField';

const uiSchema: UISchema = {
  $kind: {
    'Microsoft.IActivityTemplate': {
      'ui:field': LgField,
    },
  },
};

export default uiSchema;
