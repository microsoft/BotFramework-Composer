// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { DialogFactory } from '@bfc/shared';
export var NodeRendererContext = React.createContext({
  focusedId: '',
  focusedEvent: '',
  focusedTab: '',
  clipboardActions: [],
  getLgTemplates: function () {
    return [];
  },
  copyLgTemplate: function () {
    return Promise.resolve();
  },
  removeLgTemplate: function () {
    return Promise.resolve();
  },
  removeLgTemplates: function () {
    return Promise.resolve();
  },
  updateLgTemplate: function () {
    return Promise.resolve();
  },
  removeLuIntent: function () {
    return Promise.resolve();
  },
  dialogFactory: new DialogFactory(),
  customSchemas: [],
});
//# sourceMappingURL=NodeRendererContext.js.map
