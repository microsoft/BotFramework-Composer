// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';

export function registerLULanguage(monaco: typeof monacoEditor) {
  monaco.languages.setMonarchTokensProvider('botframeworklu', {
    ignoreCase: true,
    tokenizer: {
      root: [],
    },
  });

  monaco.languages.register({
    id: 'botframeworklu',
    extensions: ['.lu'],
    aliases: ['LU', 'language-understanding'],
    mimetypes: ['application/lu'],
  });

  monaco.languages.setLanguageConfiguration('botframeworklu', {
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
    ],
  });

  monaco.editor.defineTheme('lutheme', {
    base: 'vs',
    inherit: false,
    colors: {},
    rules: [],
  });
}
