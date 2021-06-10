// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import loader from '@monaco-editor/loader';
import { monaco } from '@monaco-editor/react';

// reset CDN path
loader.config({
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.2/min/vs',
  },
});

// initialize moanco api as early as possible
monaco.init();

export { EditorDidMount } from '@monaco-editor/react';
export * from './BaseEditor';
export * from './JsonEditor';
export * from './LgEditor';
export * from './lg/LgCodeEditor';
export * from './LuEditor';
export * from './QnAEditor';
export * from './constants';
export * from './utils/lgValidate';
export * from './types';
export * from './components/toolbar';
