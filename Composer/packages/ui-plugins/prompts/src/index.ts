// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';

import uiSchema from './uiSchema';
import visualSchema from './visualSchema';

const config: PluginConfig = {
  uiSchema,
  visual: {
    schema: visualSchema,
  },
};

export default config;
