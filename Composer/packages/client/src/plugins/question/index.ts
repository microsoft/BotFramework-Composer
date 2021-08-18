// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';

const config: PluginConfig = {
  uiSchema: {
    'Microsoft.VirtualAgents.Question': {
      flow: {
        widget: 'ActionCard',
        header: {
          widget: 'ActionHeader',
          icon: 'OfficeChat',
          colors: {
            icon: '#5C2E91',
            theme: '#EEEAF4',
          },
        },
        body: {
          widget: 'LgWidget',
          field: 'prompt',
        },
      },
      menu: {
        label: 'Ask a question (NEW)',
        submenu: false,
        order: 2,
      },
    },
  },
};

export default config;
