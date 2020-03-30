// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { EventNameField } from './EventNameField';

const config: PluginConfig = {
  uiSchema: {
    [SDKTypes.EmitEvent]: {
      properties: {
        eventName: {
          field: EventNameField,
        },
      },
    },
  },
};

export default config;
