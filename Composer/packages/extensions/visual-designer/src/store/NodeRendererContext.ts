// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

interface LgTemplate {
  Name: string;
  Body: string;
}

export const NodeRendererContext = React.createContext({
  focusedId: '',
  focusedEvent: '',
  focusedTab: '',
  clipboardActions: [] as any[],
  getLgTemplates: (_id: string, _templateName: string) => Promise.resolve([] as LgTemplate[]),
  removeLgTemplate: (_id: string, _templateName: string) => Promise.resolve(),
  removeLgTemplates: (_id: string, _templateNames: string[]) => Promise.resolve(),
  updateLgTemplate: (_id: string, _templateName: string, _template: string) => Promise.resolve('' as string),
});
