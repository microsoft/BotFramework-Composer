// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ShellApi } from '@bfc/shared';
import { LgFile } from '@bfc/indexers';

type ShellApiFuncs =
  | 'getLgTemplates'
  | 'copyLgTemplate'
  | 'removeLgTemplate'
  | 'removeLgTemplates'
  | 'updateLgTemplate';

interface NodeRendererContextValue extends Pick<ShellApi, ShellApiFuncs> {
  focusedId?: string;
  focusedEvent?: string;
  focusedTab?: string;
  lgFiles: LgFile[];
  clipboardActions: any[];
}

export const NodeRendererContext = React.createContext<NodeRendererContextValue>({
  focusedId: '',
  focusedEvent: '',
  focusedTab: '',
  lgFiles: [],
  clipboardActions: [],
  getLgTemplates: () => Promise.resolve([]),
  copyLgTemplate: () => Promise.resolve(''),
  removeLgTemplate: () => Promise.resolve(),
  removeLgTemplates: () => Promise.resolve(),
  updateLgTemplate: () => Promise.resolve(),
});
