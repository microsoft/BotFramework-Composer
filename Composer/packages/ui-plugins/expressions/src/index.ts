// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKRoles } from '@bfc/shared';

import { ExpressionField } from './ExpressionField';

const config: PluginConfig = {
  roleSchema: {
    [SDKRoles.expression]: {
      field: ExpressionField,
      helpLink: 'https://aka.ms/bot-builder-adaptive-expressions-concept',
    },
  },
};

export default config;
