// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { ShellApi, ShellData } from '@bfc/shared';

import { PluginConfig } from './types';

interface ExtensionContext {
  shellApi: ShellApi;
  shellData: ShellData;
  plugins: PluginConfig;
}

const ExtensionContext = React.createContext<ExtensionContext>({
  shellApi: {},
  shellData: {},
  plugins: {},
} as ExtensionContext);

export default ExtensionContext;
