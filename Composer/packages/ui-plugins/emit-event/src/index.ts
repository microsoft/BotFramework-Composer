// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { EventNameField } from './EventNameField';

const config: PluginConfig = {
  formSchema: {
    [SDKKinds.EmitEvent]: {
      properties: {
        eventName: {
          field: EventNameField,
        },
      },
    },
  },
};

export default config;
