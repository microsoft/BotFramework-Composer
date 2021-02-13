// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { monaco } from '@monaco-editor/react';

// initialize moanco api as early as possible
monaco.init().then(instance => {
  console.log('setting monaco on window', instance);
  // @ts-ignore
  window.monaco = instance;
});

export { EditorDidMount } from '@monaco-editor/react';
export * from './BaseEditor';
export * from './JsonEditor';
export * from './LgEditor';
export * from './LuEditor';
export * from './QnAEditor';
export * from './constants';
