// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

import { SelectDialog } from './SelectDialog';
import { DialogOptionsField } from './DialogOptionsField';

const config: PluginConfig = {
  uiSchema: {
    [SDKKinds.BeginDialog]: {
      form: {
        hidden: ['options'],
        properties: {
          dialog: {
            field: SelectDialog,
          },
          dialogOptions: {
            additionalField: true,
            field: DialogOptionsField,
            label: () => formatMessage('Options'),
            description: () => formatMessage('One or more options that are passed to the dialog that is called.'),
          },
        },
      },
    },
    [SDKKinds.ReplaceDialog]: {
      form: {
        hidden: ['options'],
        properties: {
          dialog: {
            field: SelectDialog,
          },
          dialogOptions: {
            additionalField: true,
            field: DialogOptionsField,
            label: () => formatMessage('Options'),
            description: () => formatMessage('One or more options that are passed to the dialog that is called.'),
          },
        },
      },
    },
  },
};

export default config;
