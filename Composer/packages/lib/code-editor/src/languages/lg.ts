/* eslint-disable @typescript-eslint/camelcase, no-useless-escape */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';

export function registerLGLanguage(monaco: typeof monacoEditor) {
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
        [/([a-zA-Z0-9_.'-]+)(,|\))/, ['parameter', 'delimeter']],
        //expression
        [/@\{/, { token: 'expression', next: '@expression' }],
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
        // There are only expression and normal text in multi-line mode
        [/`{3}\s*$/, 'fence-block', '@pop'],
        [/@\{/, { token: 'expression', next: '@expression' }],
        [/./, 'fence-block.content'],
      ],
      expression: [
        [/\}/, 'expression', '@pop'],
        [/([a-zA-Z][a-zA-Z0-9_.-]*)(\s*\()/, [{ token: 'function-name' }, { token: 'param_identifier' }]],
        [/'[\s\S]*?'/, 'string'],
        [/([a-zA-Z][a-zA-Z0-9_.-]*)(,|\))/, ['parameter', 'delimeter']],
        [/([a-zA-Z][a-zA-Z0-9_.-]*)/, 'parameter'],
        [/[0-9.]+/, 'number'],
        [/./, 'expression.content'],
      ],
      structure_lg: [
        [/^\s*\]\s*$/, 'structure-lg', '@pop'],
        [/\]\s*$/, 'imports', '@pop'],
        [/(\s*\[\s*)([a-zA-Z0-9_-]+\s*$)/, ['stucture-lg-identifier', 'structure-name']],
        [/^\s*>[\s\S]*$/, 'comments'],
        [/@\{/, { token: 'expression', next: '@expression' }],
        [/.*=/, { token: 'structure-property' }],
        [/./, 'structure-lg.content'],
      ],
    },
  });

  monaco.languages.register({
    id: 'botbuilderlg',
    extensions: ['.lg'],
    aliases: ['LG', 'language-generation'],
    mimetypes: ['application/lg'],
  });

  monaco.editor.defineTheme('lgtheme', {
    base: 'vs',
    inherit: false,
    colors: {},
    rules: [
      { token: 'template-name', foreground: '0000FF' },
      { token: 'function-name', foreground: '79571E' },
      { token: 'keywords', foreground: '0000FF' },
      { token: 'comments', foreground: '7A7574' },
      { token: 'number', foreground: '00A32B' },
      { token: 'string', foreground: 'DF2C2C' },
      { token: 'structure-name', foreground: '00B7C3' },
    ],
  });
}
