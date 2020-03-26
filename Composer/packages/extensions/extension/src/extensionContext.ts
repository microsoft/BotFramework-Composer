// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { ShellApi, ShellData } from '@bfc/shared';

interface ExtensionContext {
  shellApi: ShellApi;
  shellData: ShellData;
}

const ExtensionContext = React.createContext<ExtensionContext>({
  shellApi: {},
  shellData: {},
} as ExtensionContext);

export default ExtensionContext;
