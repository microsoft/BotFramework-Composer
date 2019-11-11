// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as monaco from 'monaco-editor-core';
export function registerLGLanguage() {
  monaco.languages.setMonarchTokensProvider('botbuilderlg', {
    tokenizer: {
      root: [
        //keywords
        [/(IF|ELSE|ELSEIF|SWITCH|CASE|DEFAULT|if|else|elseif|switch|case|default)\s*/, { token: 'keywords' }],

        // template name line
        [/^\s*#[\s\S]+/, 'template-name'],

        // template body
        [/^\s*-/, 'template-body'],

        //expression
        [/\{[\s\S]+?}/, 'expression'],

        //fence block
        [/^`{3}.+`{3}$/, 'fence-block'],

        //inline string
        [/(\").+?(\")/, 'inline-string'],

        //template-ref
        [/\[(.*?)(\(.*?(\[.+\])?\))?\]/, 'template-ref'],

        //parameters
        [/\([\s\S]*?\)\s*/, 'parameters'],

        // import statement in lg
        [/\[.*\]/, 'imports'],

        [/^\s*>[\s\S]*/, 'comments'],
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
      { token: 'template-name', foreground: '416DE7' },
      { token: 'fence-block', foreground: 'FB4C3E' },
      { token: 'expression', foreground: 'D822FF', fontStyle: 'bold' },
      { token: 'keywords', foreground: 'B44EBF' },
      { token: 'template-ref', foreground: '66D274' },
      { token: 'comments', foreground: '9CAABF' },
      { token: 'parameters', foreground: '008800' },
      { token: 'inline-string', foreground: '00EA00' },
    ],
  });
}
