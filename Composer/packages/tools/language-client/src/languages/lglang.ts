// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function registerLGLanguage(monaco) {
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
        // import statement in lg
        [/\[.*\]/, 'imports'],
        //inline string
        [/^\s*\"/, { token: 'inline-string', next: '@inline_string' }],
        //bracktets
        [/[{}()\[\]]/, '@brackets'],
      ],
      comments: [
        [/^\s*#/, { token: 'template-name', next: '@template_name' }],
        [/^\s*-/, { token: 'template-body-identifier', next: '@template_body' }],
        [/./, 'comments'],
      ],
      template_name: [
        //comments
        [/^\s*>/, { token: 'comments', next: '@comments' }],
        //template_body
        [/^\s*-/, { token: 'template-body-identifier', goBack: 1, next: '@template_body' }],
        // structure_lg
        [/^\s*\[/, { token: 'structure-lg', next: '@structure_lg' }],
        //parameter in template name
        [/([a-zA-Z0-9_.'-]+)(,|\))/, ['parameter', 'delimeter']],
        // other
        [/[^\()]/, 'template-name'],
      ],
      template_body: [
        //pop
        [/[/s/S]*$/, '@pop'],
        //comments
        [/^\s*>/, { token: 'comments', next: '@comments' }],
        //template name
        [/^\s*#/, { token: 'template-name', next: '@template_name' }],
        //keywords
        [/(\s*-\s*)(if|else|else\s*if|switch|case|default)(\s*:)/, ['identifier', 'keywords', 'colon']],
        //template_body
        [/^\s*-/, { token: 'template-body-identifier', next: '@template_body' }],
        //fence block
        [/`{3}/, { token: 'fence-block', next: '@fence_block' }],
        //template-ref
        [/\[/, { token: 'template-ref', next: 'template_ref' }],
        //expression
        [/@\{/, { token: 'expression', next: '@expression' }],
      ],

      template_ref: [
        [/\]/, 'template-ref', '@pop'],
        [/([a-zA-Z0-9_.-]+)(\()/, [{ token: 'function-name' }, { token: 'param_identifier' }]],
        [/'[\s\S]*?'/, 'string'],
        [/([a-zA-Z][a-zA-Z0-9_.-]*)(,|\))/, ['parameter', 'delimeter']],
        [/([a-zA-Z][a-zA-Z0-9_.-]*)/, 'parameter'],
        [/[0-9.]+/, 'number'],
      ],

      fence_block: [
        [/`{3}\s*$/, 'fence-block', '@pop'],
        [/@\{/, { token: 'expression', next: '@expression' }],
        [/./, 'fence-block.content'],
      ],
      inline_string: [
        [/\"\s*$/, 'inline-string', '@pop'],
        [/\{/, { token: 'expression', next: '@expression' }],
        [/./, 'inline-string.content'],
      ],
      expression: [
        [/\}/, 'expression', '@pop'],
        [/([a-zA-Z][a-zA-Z0-9_.-]*)(\()/, [{ token: 'function-name' }, { token: 'param_identifier' }]],
        [/'[\s\S]*?'/, 'string'],
        [/([a-zA-Z][a-zA-Z0-9_.-]*)(,|\))/, ['parameter', 'delimeter']],
        [/([a-zA-Z][a-zA-Z0-9_.-]*)/, 'parameter'],
        [/[0-9.]+/, 'number'],
        [/./, 'expression.content'],
      ],
      structure_lg: [
        [/^\s*\]\s*$/, 'structure-lg', '@pop'],
        [/^\s*>[\s\S]*$/, 'comments'],
        [/(=|\|)([a_zA-Z0-9@ ]|\@)*\{/, { token: 'expression', next: '@expression' }],
        [/^\s*@\{/, { token: 'expression', next: '@expression' }],
        [/=\s*[\s\S]+\s*$/, { token: 'structure-property' }],
        [/\s*[a-zA-Z0-9_-]+\s*$/, { token: 'structure-name' }],
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
