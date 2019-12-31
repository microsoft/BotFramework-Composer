// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';

export function registerLULanguage(monaco: typeof monacoEditor) {
  monaco.languages.setMonarchTokensProvider('botframeworklu', {
    tokenizer: {
      root: [
        [/^\s*#/, { token: 'intent-indentifier', next: '@intent' }],
        [/^\s*@/, { token: 'entity-identifier', goBack: 1, next: '@entity_mode' }],
        [/^\s*>\s*[\s\S]*$/, { token: 'comments' }],
      ],

      intent: [
        [/^\s*#/, { token: 'intent-indentifier', next: '@intent' }],
        [/^\s*-/, { token: 'utterrance-indentifier', next: '@utterrance' }],
        [/^\s*>\s*[\s\S]*$/, { token: 'comments' }],
        [/^\s*@/, { token: 'entity-identifier', goBack: 1, next: '@entity_mode' }],
        [/.*$/, 'intent-name'],
      ],
      utterrance: [
        [/^\s*#/, { token: 'intent', next: '@intent' }],
        [/^\s*>\s*[\s\S]*$/, { token: 'comments' }],
        [/^\s*-/, { token: 'utterrance-indentifier', next: 'utterrance' }],
        [/^\s*@/, { token: 'entity-identifier', goBack: 1, next: '@entity_mode' }],
        [/({)(\s*[\w.\:\s]*\s*)(=)(\s*[\w.]*\s*)(})/, ['lb', 'pattern', 'equal', 'entity-name', 'rb']],
        [/({\s*@)(\s*[\w.]*\s*)(})/, ['lb', 'entity-name', 'rb']],
        [/^\s*\[[\w\s.]+\]\(.{1,2}\/[\w.*]+(#[\w.?]+)?\)/, 'import-desc'],
        [/./, 'utterance-other'],
      ],
      entity_mode: [
        [/^\s*#/, { token: 'intent', next: '@intent' }],
        [/^\s*>\s*[\s\S]*$/, { token: 'comments' }],
        [/^\s*-/, { token: 'utterrance-indentifier', next: 'utterrance' }],
        [
          /(@\s*)(ml|prebuilt|regex|list|composite|patternany|phraselist)(\s*\w*)/,
          ['intent-indentifier', 'entity-type', 'entity-name'],
        ],
        [/(@\s*)(\s*\w*)/, ['intent-indentifier', 'entity-name']],
        [/\s*(hasRoles|useFeature)\s*/, 'keywords'],
        [/.*$/, 'entity-other', '@pop'],
      ],
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
    rules: [
      { token: 'intent-name', foreground: '0000FF' },
      { token: 'pattern', foreground: '00B7C3' },
      { token: 'entity-name', foreground: '038387' },
      { token: 'comments', foreground: '7A7A7A' },
      { token: 'import-desc', foreground: '00A32B' },
      { token: 'entity-type', foreground: 'DF2C2C' },
      { token: 'keywords', foreground: '0078D7' },
    ],
  });
}
