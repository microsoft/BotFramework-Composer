// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { SelectDialog } from './SelectDialog';

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.BeginDialog]: {
      form: {
        properties: {
          dialog: {
            field: SelectDialog,
          },
        },
      },
    },
    [SDKKinds.ReplaceDialog]: {
      form: {
        properties: {
          dialog: {
            field: SelectDialog,
          },
        },
      },
    },
  },
};

export default config;
