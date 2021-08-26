// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig, SDKKinds } from '@bfc/extension-client';

import { PropertyWidget } from './PropertyWidget';
const config: PluginConfig = {
  widgets: {
    flow: {
      PropertyWidget,
    },
  },
  uiSchema: {
    [SDKKinds.Foreach]: {
      flow: {
        widget: 'ForeachWidget',
        loop: {
          widget: 'ActionCard',
          body: {
            widget: 'PropertyWidget',
          },
        },
      },
    },
    [SDKKinds.ForeachPage]: {
      flow: {
        widget: 'ForeachWidget',
        loop: {
          widget: 'ActionCard',
          body: {
            widget: 'PropertyWidget',
          },
        },
      },
    },
  },
};

export default config;
