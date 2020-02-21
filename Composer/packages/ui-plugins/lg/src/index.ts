// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { LgField } from './LgField';

const config: PluginConfig = {
  kindSchema: {
    [SDKKinds.IActivityTemplate]: {
      field: LgField,
    },
  },
};

export default config;
