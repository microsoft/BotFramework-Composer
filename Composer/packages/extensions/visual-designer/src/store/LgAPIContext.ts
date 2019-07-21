import React from 'react';

import { LgTemplate } from '../components/shared/sharedProps';

export const LgAPIContext = React.createContext({
  getLgTemplates: (_id: string, _templateName: string) => Promise.resolve([] as LgTemplate[]),
  removeLgTemplate: (_id: string, _templateName: string) => Promise.resolve(),
});
