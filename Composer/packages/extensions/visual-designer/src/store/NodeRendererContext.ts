// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ShellApi } from '@bfc/shared';

type ShellApiFuncs =
  | 'getLgTemplates'
  | 'copyLgTemplate'
  | 'removeLgTemplate'
  | 'removeLgTemplates'
  | 'updateLgTemplate'
  | 'removeLuIntent';

interface NodeRendererContextValue extends Pick<ShellApi, ShellApiFuncs> {
  focusedId?: string;
  focusedEvent?: string;
  focusedTab?: string;
  clipboardActions: any[];
}

export const NodeRendererContext = React.createContext<NodeRendererContextValue>({
  focusedId: '',
  focusedEvent: '',
  focusedTab: '',
  clipboardActions: [],
  getLgTemplates: () => Promise.resolve([]),
  copyLgTemplate: () => Promise.resolve(''),
  removeLgTemplate: () => Promise.resolve(),
  removeLgTemplates: () => Promise.resolve(),
  updateLgTemplate: () => Promise.resolve(),
  removeLuIntent: () => Promise.resolve(),
});
