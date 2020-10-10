// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { Shell } from '@bfc/types';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { PluginConfig } from '../types';

interface EditorExtensionProps {
  shell: Shell;
  plugins: PluginConfig;
  projectId: string;
}

export const EditorExtension: React.FC<EditorExtensionProps> = ({ shell, plugins, children, projectId }) => {
  const context = useMemo(() => {
    return { shellApi: shell.api, shellData: shell.data, plugins, projectId };
  }, [shell.api, shell.data, plugins]);

  return <EditorExtensionContext.Provider value={context}>{children}</EditorExtensionContext.Provider>;
};
