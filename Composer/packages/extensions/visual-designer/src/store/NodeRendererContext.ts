import React from 'react';

interface LgTemplate {
  Name: string;
  Body: string;
}

export const NodeRendererContext = React.createContext({
  focusedId: '',
  focusedEvent: '',
  clipboardActions: [],
  getLgTemplates: (_id: string, _templateName: string) => Promise.resolve([] as LgTemplate[]),
  removeLgTemplate: (_id: string, _templateName: string) => Promise.resolve(),
});
