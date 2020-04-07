// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { LGTemplate } from 'botbuilder-lg';
import { ShellApi, DialogFactory } from '@bfc/shared';

type ShellApiFuncs =
  | 'getLgTemplates'
  | 'copyLgTemplate'
  | 'removeLgTemplate'
  | 'removeLgTemplates'
  | 'updateLgTemplate'
  | 'removeLuIntent';

export interface NodeRendererContextValue extends Pick<ShellApi, ShellApiFuncs> {
  focusedId?: string;
  focusedEvent?: string;
  focusedTab?: string;
  clipboardActions: any[];
  getLgTemplateSync: (lgTemplateName: string) => LGTemplate | undefined;
  dialogFactory: DialogFactory;
}

export const NodeRendererContext = React.createContext<NodeRendererContextValue>({
  focusedId: '',
  focusedEvent: '',
  focusedTab: '',
  clipboardActions: [],
  getLgTemplateSync: () => undefined,
  getLgTemplates: () => [],
  copyLgTemplate: () => Promise.resolve(),
  removeLgTemplate: () => Promise.resolve(),
  removeLgTemplates: () => Promise.resolve(),
  updateLgTemplate: () => Promise.resolve(),
  removeLuIntent: () => Promise.resolve(),
  dialogFactory: new DialogFactory(),
});
