// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as MonacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

export function registerLULanguage(monaco: typeof MonacoEditor) {
  monaco.languages.setMonarchTokensProvider('lu', {
    tokenizer: {
      root: [
        [/^\s*#/, { token: 'intent', next: '@intent' }],
        [/^\s*@/, { token: 'entity-identifier', goBack: 1, next: '@entityMode' }],
        [/^\s*>\s*[\s\S]*$/, { token: 'comments' }],
        [/^\s*-/, { token: 'utterrance-indentifier', next: '@utterrance' }],
      ],

      intent: [
        [/^\s*#/, { token: 'intent', next: '@intent' }],
        [/^\s*-/, { token: 'utterrance-indentifier', next: '@utterrance' }],
        [/^\s*>\s*[\s\S]*$/, { token: 'comments' }],
        [/^\s*@/, { token: 'entity-identifier', goBack: 1, next: '@entityMode' }],
        [/.*$/, 'intent'],
      ],
      utterrance: [
        [/^\s*#/, { token: 'intent', next: '@intent' }],
        [/^\s*>\s*[\s\S]*$/, { token: 'comments' }],
        [/^\s*-/, { token: 'utterrance-indentifier', next: 'utterrance' }],
        [/^\s*@/, { token: 'entity-identifier', goBack: 1, next: '@entityMode' }],
        [/({)(\s*[\w.@:\s]*\s*)(=)(\s*[\w.\s]*\s*)(})/, ['lb', 'pattern', 'equal', 'entity-name', 'rb']],
        [/({\s*@)(\s*[\w.]*\s*)(})/, ['lb', 'entity-name', 'rb']],
        // eslint-disable-next-line security/detect-unsafe-regex
        [/\s*\[[\w\s.]+\]\(.{1,2}\/[\w.*]+(#[\w.?]+)?\)/, 'import-desc'],
        [/./, 'utterance-other'],
      ],
      entityMode: [
        [/^\s*#/, { token: 'intent', next: '@intent' }],
        [/^\s*>\s*[\s\S]*$/, { token: 'comments' }],
        [/^\s*-/, { token: 'utterrance-indentifier', next: 'utterrance' }],
        [
          /(@\s*)(prebuilt\s*)(age|datetimeV2|dimension|email|geographyV2|keyPhrase|money|number|ordinal|ordinalV2|percentage|personName|phonenumber|temperature|url|datetime)(\s*[\w_,\s]+)/,
          ['intent-indentifier', 'entity-type', 'prebult-type', 'entity-name'],
        ],
        [
          // eslint-disable-next-line security/detect-unsafe-regex
          /(@\s*)(ml|prebuilt|regex|list|composite|patternany|phraselist)(\s*[\w_]+)/,
          ['intent-indentifier', 'entity-type', 'entity-name'],
        ],
        [/(@\s*)(\s*[\w_]+)/, ['intent-indentifier', 'entity-name']],
        [/\s*(hasRoles|useFeature)\s*/, 'keywords'],
        [/.*$/, 'entity-other', '@pop'],
      ],
    },
  });

  monaco.languages.register({
    id: 'lu',
    extensions: ['.lu'],
    aliases: ['LU', 'language-understanding'],
    mimetypes: ['application/lu'],
  });

  monaco.languages.setLanguageConfiguration('lu', {
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
    ],
  });

  monaco.editor.defineTheme('lu', {
    base: 'vs',
    inherit: false,
    colors: {},
    rules: [
      { token: 'intent', foreground: '0000FF' },
      { token: 'pattern', foreground: '00B7C3' },
      { token: 'entity-name', foreground: '038387' },
      { token: 'comments', foreground: '7A7A7A' },
      { token: 'import-desc', foreground: '00A32B' },
      { token: 'entity-type', foreground: 'DF2C2C' },
      { token: 'prebult-type', foreground: 'DF2C2C' },
      { token: 'keywords', foreground: '0078D7' },
    ],
  });
}
