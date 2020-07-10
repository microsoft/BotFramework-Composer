// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  extends: ['./.eslintrc.js', 'plugin:react/recommended'],
  plugins: ['react-hooks', 'format-message', 'emotion', 'jsx-a11y'],
  settings: {
    react: {
      version: '16.9.16',
    },
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // format message
    'format-message/literal-pattern': 'error',
    'format-message/no-invalid-pattern': 'error',
    'format-message/no-missing-params': ['error', { allowNonLiteral: false }],

    // react hooks
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'error',

    // react
    'react/display-name': 'off',
    'react/no-danger': 'error',
    'react/no-deprecated': 'warn',
    'react/prop-types': 'warn',
    'react/no-unknown-property': 'error',
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
    // https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-sort-props.md
    'react/jsx-sort-props': [
      'error',
      { callbacksLast: true, ignoreCase: true, shorthandFirst: true, reservedFirst: true },
    ],

    // emotion
    'emotion/jsx-import': 'error',

    // jsx-a11y
    // taken from https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/src/index.js
    'jsx-a11y/accessible-emoji': 'warn',
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-role': 'warn',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/control-has-associated-label': [
      'off',
      {
        ignoreElements: ['audio', 'canvas', 'embed', 'input', 'textarea', 'tr', 'video'],
        ignoreRoles: [
          'grid',
          'listbox',
          'menu',
          'menubar',
          'radiogroup',
          'row',
          'tablist',
          'toolbar',
          'tree',
          'treegrid',
        ],
        includeRoles: ['alert', 'dialog'],
      },
    ],
    'jsx-a11y/heading-has-content': 'warn',
    'jsx-a11y/html-has-lang': 'warn',
    'jsx-a11y/iframe-has-title': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/interactive-supports-focus': [
      'warn',
      {
        tabbable: ['button', 'checkbox', 'link', 'searchbox', 'spinbutton', 'switch', 'textbox'],
      },
    ],
    'jsx-a11y/label-has-associated-control': 'warn',
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/media-has-caption': 'warn',
    'jsx-a11y/mouse-events-have-key-events': 'warn',
    'jsx-a11y/no-access-key': 'warn',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-distracting-elements': 'warn',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': [
      'warn',
      {
        tr: ['none', 'presentation'],
      },
    ],
    'jsx-a11y/no-noninteractive-element-interactions': [
      'warn',
      {
        handlers: ['onClick', 'onError', 'onLoad', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
        alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        body: ['onError', 'onLoad'],
        dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        iframe: ['onError', 'onLoad'],
        img: ['onError', 'onLoad'],
      },
    ],
    'jsx-a11y/no-noninteractive-element-to-interactive-role': [
      'warn',
      {
        ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
        table: ['grid'],
        td: ['gridcell'],
      },
    ],
    'jsx-a11y/no-noninteractive-tabindex': [
      'warn',
      {
        tags: [],
        roles: ['tabpanel'],
        allowExpressionValues: true,
      },
    ],
    'jsx-a11y/no-onchange': 'warn',
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/no-static-element-interactions': [
      'warn',
      {
        allowExpressionValues: true,
        handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
      },
    ],
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'jsx-a11y/scope': 'warn',
    'jsx-a11y/tabindex-no-positive': 'warn',
  },
  overrides: [
    {
      files: ['**/*.+(ts|tsx)'],
      rules: {
        'react/prop-types': 'off',
      },
    },
    {
      files: ['**/*.+(test|spec).+(js|jsx|ts|tsx)'],
      rules: {
        'react/display-name': 'off',
        'react/prop-types': 'off',
        'react/no-danger': 'off',
      },
    },
  ],
};
