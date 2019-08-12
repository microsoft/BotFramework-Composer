import React from 'react';

import { LgTemplate } from '../components/shared/sharedProps';

export const NodeRendererContext = React.createContext({
  focusedId: '',
  focusedEvent: '',
  getLgTemplates: (_id: string, _templateName: string) => Promise.resolve([] as LgTemplate[]),
  removeLgTemplate: (_id: string, _templateName: string) => Promise.resolve(),
});
