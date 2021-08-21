// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension-client';

const config: PluginConfig = {
  uiSchema: {
    'Microsoft.VirtualAgents.Question': {
      flow: {
        widget: 'QuestionWidget',

        question: {
          widget: 'ActionCard',
          body: {
            widget: 'LgWidget',
            field: 'prompt',
          },
          header: {
            widget: 'ActionHeader',
            icon: 'OfficeChat',
            colors: {
              icon: '#5C2E91',
              theme: '#EEEAF4',
            },
          },
        },
      },
      menu: {
        label: 'Ask a question (NEW)',
        submenu: false,
        order: 2,
      },
    },
    'VisualSDK.QuestionConditionNode': {
      flow: {
        widget: 'ActionCard',
        body: {
          widget: 'PropertyDescription',
          description: '',
          property: '=action.condition',
        },
        header: {
          widget: 'ActionHeader',
          colors: {
            theme: '#e7f4ff',
          },
          disableSDKTitle: true,
          title: 'Condition',
        },
      },
    },
  },
};

export default config;
