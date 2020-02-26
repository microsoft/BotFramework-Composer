/* eslint-disable @typescript-eslint/camelcase, no-useless-escape */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as MonacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

function createKeywordsProposals(range) {
  // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
  // here you could do a server side lookup
  return [
    {
      label: 'IF',
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: `IF: @{}
-
- ELSEIF: @{}
    -
- ELSE:
    - `,
      range: range,
    },
    {
      label: 'ELSEIF',
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: 'ELSEIF:@{}',
      range: range,
    },
    {
      label: 'ELSE',
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: 'ELSE:\n',
      range: range,
    },
    {
      label: 'SWITCH',
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: `SWITCH: @{}
- CASE: @{}
    -
- DEFAULT:
    - `,
      range: range,
    },
  ];
}

export function registerLGLanguage(monaco: typeof MonacoEditor) {
  monaco.languages.setMonarchTokensProvider('botbuilderlg', {
    ignoreCase: true,
    brackets: [
      { open: '{', close: '}', token: 'delimiter.curly' },
      { open: '[', close: ']', token: 'delimiter.bracket' },
      { open: '(', close: ')', token: 'delimiter.parenthesis' },
    ],
    tokenizer: {
      root: [
        // template name line
        [/^\s*#/, { token: 'template-name', next: '@template_name' }],
        // template body
        [/^\s*-/, { token: 'template-body-identifier', goBack: 1, next: '@template_body' }],
        //comments
        [/^\s*>/, { token: 'comments', next: '@comments' }],
        //dealing with inline-lg
        [/^\s*\[/, { token: 'structure-lg-identifier', goBack: 1, next: '@structure_lg' }],
      ],
      comments: [
        [/^\s*#/, { token: 'template-name', next: '@template_name' }],
        [/^\s*-/, { token: 'template-body-identifier', next: '@template_body' }],
        [/.*$/, 'comments', '@pop'],
      ],
      template_name: [
        //comments
        [/^\s*>/, { token: 'comments', next: '@comments' }],
        //fence block
        [/^\s*-\s*`{3}/, { token: 'fence-block', next: '@fence_block' }],
        //template_body
        [/^\s*-/, { token: 'template-body-identifier', goBack: 1, next: '@template_body' }],
        // structure_lg
        [/^\s*\[/, { token: 'structure-lg-identifier', goBack: 1, next: '@structure_lg' }],
        //parameter in template name
        [/([a-zA-Z0-9_][a-zA-Z0-9_-]*)(,|\))/, ['parameter', 'delimeter']],
        // other
        [/[^\()]/, 'template-name'],
      ],
      template_body: [
        //comments
        [/^\s*>/, { token: 'comments', next: '@comments' }],
        //template name
        [/^\s*#/, { token: 'template-name', next: '@template_name' }],
        //keywords
        [/(\s*-\s*)(if|else|else\s*if|switch|case|default)(\s*:)/, ['identifier', 'keywords', 'colon']],
        //fence block
        [/^\s*-\s*`{3}/, { token: 'fence-block', next: '@fence_block' }],
        //template_body
        [/^\s*-/, { token: 'template-body-identifier', next: '@template_body' }],
        //expression
        [/@\{/, { token: 'expression', next: '@expression' }],
      ],
      fence_block: [
        [/`{3}\s*/, { token: 'fence-block', next: '@pop' }],
        [/@\{/, { token: 'expression', next: '@expression' }],
        [/./, 'fence-block'],
      ],
      expression: [
        [/\}/, 'expression', '@pop'],
        [/(\s*[a-zA-Z_][a-zA-Z0-9_-]*)(\s*\()/, [{ token: 'function-name' }, { token: 'param_identifier' }]],
        [/(\s*[a-zA-Z_][a-zA-Z0-9_.-]*\s*)(,|\))/, ['parameter', 'delimeter']],
        [/\s*[0-9.]+\s*/, 'number'],
        [/(\s*'[^']*?'\s*)(,|\))/, ['string', 'delimeter']],
        [/(\s*"[^"]*?"\s*)(,|\))/, ['string', 'delimeter']],
        [/(\s*[^},'"(]*\s*)(,|\))/, ['other-expression', 'delimeter']],
        [/[^@}]*$/, { token: 'expression.content', next: '@pop' }],
      ],
      structure_lg: [
        [/^\s*\]\s*$/, 'structure-lg', '@pop'],
        [/\]\s*\(.*\)$/, 'imports', '@pop'],
        [/(\s*\[\s*)([a-zA-Z0-9_-]+\s*$)/, ['stucture-lg-identifier', 'structure-name']],
        [/^\s*>[\s\S]*$/, 'comments'],
        [/\|/, { token: 'alternative' }],
        [/@\{/, { token: 'expression', next: '@expression' }],
      ],
    },
  });

  monaco.languages.register({
    id: 'botbuilderlg',
    extensions: ['.lg'],
    aliases: ['LG', 'language-generation'],
    mimetypes: ['application/lg'],
  });

  monaco.languages.setLanguageConfiguration('botbuilderlg', {
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
    ],
  });

  monaco.editor.defineTheme('lgtheme', {
    base: 'vs',
    inherit: false,
    colors: {},
    rules: [
      { token: 'template-name', foreground: 'CA5010' },
      { token: 'function-name', foreground: 'CA5010' },
      { token: 'keywords', foreground: '0078D7' },
      { token: 'comments', foreground: '7A7574' },
      { token: 'parameter', foreground: '004E8C' },
      { token: 'fence-block', foreground: '038387' },
      { token: 'string', foreground: 'DF2C2C' },
      { token: 'structure-name', foreground: '00B7C3' },
    ],
  });

  monaco.languages.registerCompletionItemProvider('botbuilderlg', {
    provideCompletionItems: function(model, position) {
      const lineText = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      // keywords only be allowed in line start.
      if (/\s*-\s*\w*$/.test(lineText) === false) {
        return { suggestions: [] };
      }

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return {
        suggestions: createKeywordsProposals(range),
      };
    },
  });
}
