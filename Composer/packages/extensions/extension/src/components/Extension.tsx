// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useMemo } from 'react';
import { Shell } from '@bfc/shared';

import ExtensionContext from '../extensionContext';
import { PluginConfig } from '../types';

interface ExtensionProps {
  shell: Shell;
  plugins: PluginConfig;
  projectId: string;
}

export const Extension: React.FC<ExtensionProps> = ({ shell, plugins, children, projectId }) => {
  const context = useMemo(() => {
    return { shellApi: shell.api, shellData: shell.data, plugins, projectId };
  }, [shell.api, shell.data, plugins, projectId]);

  return <ExtensionContext.Provider value={context}>{children}</ExtensionContext.Provider>;
};

export default Extension;
