// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FlowUISchema } from '@bfc/extension';

const builtinVisualSDKSchema: FlowUISchema = {
  default: {
    widget: 'ActionHeader',
  },
  custom: {
    widget: 'ActionHeader',
    colors: { theme: '#69797E', color: '#FFFFFF' },
  },
};

export default builtinVisualSDKSchema;
