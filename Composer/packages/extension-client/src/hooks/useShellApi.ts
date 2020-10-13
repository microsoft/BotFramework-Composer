// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useContext } from 'react';
import { ShellApi, ShellData } from '@bfc/types';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { PluginConfig } from '../types';

interface ShellContext extends ShellData {
  shellApi: ShellApi;
  plugins: PluginConfig;
}

export function useShellApi(): ShellContext {
  const { shellApi, shellData, plugins } = useContext(EditorExtensionContext);

  if (!shellApi) {
    // eslint-disable-next-line no-console
    console.error(new Error('No ShellApi in Extension Context!'));
    return {} as ShellContext;
  }

  if (!shellData) {
    // eslint-disable-next-line no-console
    console.error(new Error('No ShellData in Extension Context!'));
    return {} as ShellContext;
  }

  return { shellApi, plugins, ...shellData };
}
