// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useMemo } from 'react';
import { ShellApi, ShellData } from '@bfc/shared';

import ExtensionContext from '../extensionContext';
import { PluginConfig } from '../types';

interface ExtensionProps {
  shell: ShellApi;
  shellData: ShellData;
  plugins: PluginConfig[];
}

export const Extension: React.FC<ExtensionProps> = function Extension(props) {
  const { shell, shellData, plugins } = props;

  const context = useMemo(() => {
    return { shellApi: shell, shellData, plugins };
  }, [shell, shellData, plugins]);

  return <ExtensionContext.Provider value={context}>{props.children}</ExtensionContext.Provider>;
};

export default Extension;
