import React from 'react';
import { string } from 'prop-types';

interface LgTemplate {
  Name: string;
  Body: string;
}

export const NodeRendererContext = React.createContext({
  focusedId: '',
  focusedEvent: '',
  focusedTab: '',
  getLgTemplates: (_id: string, _templateName: string) => Promise.resolve([] as LgTemplate[]),
  removeLgTemplate: (_id: string, _templateName: string) => Promise.resolve(),
  updateLgTemplate: (_id: string, _templateName: string, _template: string) => Promise.resolve('' as string),
});
