// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig, SDKKinds } from '@bfc/extension-client';

import { GreetingWidget } from './GreetingWidget';

const config: PluginConfig = {
  widgets: {
    flow: {
      GreetingWidget,
    },
  },
  uiSchema: {
    [SDKKinds.OnConversationUpdateActivity]: {
      flow: {
        widget: 'ActionCard',
        header: {
          colors: {
            theme: '#E7F4F4',
          },
          widget: 'ActionHeader',
        },
        body: {
          widget: 'GreetingWidget',
        },
      },
    },
    [SDKKinds.OnBeginDialog]: {
      flow: {
        widget: 'ActionCard',
        header: {
          colors: {
            theme: '#E7F4F4',
          },
          widget: 'ActionHeader',
        },
      },
    },
  },
};

export default config;
