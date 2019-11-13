// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as JsonWorker from '@bfcomposer/monaco-editor/esm/vs/language/json/json.worker';
import * as EditorWorker from '@bfcomposer/monaco-editor/esm/vs/editor/editor.worker';

export * from './BaseEditor';
export * from './JsonEditor';
export * from './LgEditor';
export * from './LuEditor';
export * from './RichEditor';
export * from './LSPEditors/LGLSPEditor';

declare global {
  interface Window {
    MonacoEnvironment: any;
  }
}

(window as Window & typeof globalThis).MonacoEnvironment = {
  getWorker: (_1, label) => {
    if (label === 'json') {
      return new JsonWorker();
    }
    return new EditorWorker();
  },
};
