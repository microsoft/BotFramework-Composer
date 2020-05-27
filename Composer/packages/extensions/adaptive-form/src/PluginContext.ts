// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { PluginConfig } from '@bfc/extension';

const PluginContext = React.createContext<Required<PluginConfig>>({
  formSchema: {},
  visualSchema: {},
  roleSchema: {},
  // kindSchema: {},
  recognizers: [],
});

export default PluginContext;
