// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { Shell } from '@bfc/shared';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { PluginConfig } from '../types';

interface EditorExtensionProps {
  shell: Shell;
  plugins: PluginConfig;
}

export const EditorExtension: React.FC<EditorExtensionProps> = ({ shell, plugins, children }) => {
  const context = useMemo(() => {
    return { shellApi: shell.api, shellData: shell.data, plugins };
  }, [shell.api, shell.data, plugins]);

  return <EditorExtensionContext.Provider value={context}>{children}</EditorExtensionContext.Provider>;
};
