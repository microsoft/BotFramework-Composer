// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';

import formSchema from './formSchema';
import flowSchema from './flowSchema';

const config: PluginConfig = {
  formSchema: formSchema,
  visualSchema: {
    schema: flowSchema,
  },
};

export default config;
