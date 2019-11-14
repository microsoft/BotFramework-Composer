// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

interface LgTemplate {
  Name: string;
  Body: string;
}

interface NodeRendererContextValue {
  focusedId?: string;
  focusedEvent?: string;
  focusedTab?: string;
  clipboardActions: any[];
  getLgTemplates: (_id: string, _templateName: string) => Promise<LgTemplate[]>;
  removeLgTemplate: (_id: string, _templateName: string) => Promise<void>;
  removeLgTemplates: (_id: string, _templateNames: string[]) => Promise<void>;
  updateLgTemplate: (_id: string, _templateName: string, _template: string) => Promise<void>;
}

export const NodeRendererContext = React.createContext<NodeRendererContextValue>({
  focusedId: '',
  focusedEvent: '',
  focusedTab: '',
  clipboardActions: [],
  getLgTemplates: () => Promise.resolve([]),
  removeLgTemplate: () => Promise.resolve(),
  removeLgTemplates: () => Promise.resolve(),
  updateLgTemplate: () => Promise.resolve(),
});
