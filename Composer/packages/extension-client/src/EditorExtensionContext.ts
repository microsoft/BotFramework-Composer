// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { ShellApi, ShellData } from '@bfc/types';

import { PluginConfig } from './types';

interface EditorExtensionContext {
  shellApi: ShellApi;
  shellData: ShellData;
  plugins: PluginConfig;
}

export const EditorExtensionContext = React.createContext<EditorExtensionContext>({
  shellApi: {},
  shellData: {},
  plugins: {},
} as EditorExtensionContext);
