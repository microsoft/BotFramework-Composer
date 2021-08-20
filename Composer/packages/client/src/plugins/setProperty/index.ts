// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig, SDKKinds } from '@bfc/extension-client';
import { NeutralColors } from '@uifabric/fluent-theme';

import { SetPropertyWidget } from './SetPropertyWidget';
const config: PluginConfig = {
  widgets: {
    flow: {
      SetPropertyWidget,
    },
  },
  uiSchema: {
    [SDKKinds.SetProperty]: {
      flow: {
        widget: 'ActionCard',
        header: {
          colors: {
            theme: NeutralColors.gray70,
          },
          widget: 'ActionHeader',
        },
        body: {
          widget: 'SetPropertyWidget',
        },
      },
    },
  },
};

export default config;
