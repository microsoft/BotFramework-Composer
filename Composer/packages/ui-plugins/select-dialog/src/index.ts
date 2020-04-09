// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';

import uiSchema from './uiSchema';

export * from './ComboBoxField';

const config: PluginConfig = {
  uiSchema,
};

export default config;
