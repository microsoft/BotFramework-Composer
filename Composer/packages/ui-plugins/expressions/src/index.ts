// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKRoles, SDKTypes } from '@bfc/shared';

import { ExpressionField } from './ExpressionField';
import { SetProperty } from './SetPropertyField';

const config: PluginConfig = {
  roleSchema: {
    [SDKRoles.expression]: {
      field: ExpressionField,
    },
  },
  uiSchema: {
    [SDKTypes.SetProperties]: {
      properties: {
        assignments: {
          properties: {
            arrayField: SetProperty,
          },
        },
      },
    },
  },
};

export default config;
