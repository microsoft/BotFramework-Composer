// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier/@typescript-eslint',
    'plugin:@bfc/bfcomposer/recommended',
  ],
  plugins: ['import', 'notice', 'security', 'lodash'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    'notice/notice': [
      'error',
      {
        mustMatch: 'Copyright \\(c\\) Microsoft Corporation',
        templateFile: require.resolve('./license.js'),
      },
    ],

    // typescript
    '@typescript-eslint/ban-ts-ignore': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-use-before-define': 'warn',

    // eslint rules
    'no-dupe-class-members': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'dot-notation': 'error',
    yoda: 'error',
    'no-bitwise': 'error',
    // eqeqeq: 'error',
    'no-underscore-dangle': [
      'error',
      {
        // add special window.__foo__ names as exceptions here
        allow: ['__nonce__', '__IS_ELECTRON__'],
        // allow this._name so custom getters and setters can be written gracefully
        allowAfterThis: true,
        enforceInMethodNames: true,
      },
    ],
    'prefer-arrow-callback': 'error',

    // plugin: import
    'import/first': 'error',
    'import/order': ['error', { 'newlines-between': 'always' }],

    // security
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-object-injection': 'off',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',

    // lodash
    'lodash/callback-binding': 'error',
    'lodash/collection-method-value': 'error',
    'lodash/collection-return': 'error',
    'lodash/no-double-unwrap': 'error',
    'lodash/no-extra-args': 'error',
    'lodash/no-unbound-this': 'error',
    'lodash/unwrap': 'error',
    'lodash/identity-shorthand': 'error',
    'lodash/import-scope': ['error', 'method'],
    'lodash/matches-prop-shorthand': 'error',
    'lodash/matches-shorthand': 'error',
    'lodash/path-style': 'error',
    'lodash/prefer-compact': 'error',
    'lodash/prefer-flat-map': 'error',
    'lodash/prefer-immutable-method': 'error',
    'lodash/prefer-map': 'error',
    'lodash/prefer-reject': 'error',
    'lodash/preferred-alias': 'error',
    'lodash/prop-shorthand': 'error',
  },
  overrides: [
    {
      files: ['**/*.+(test|spec).+(js|jsx|ts|tsx)'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-object-literal-type-assertion': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-explicit-any': 'off',

        'security/detect-buffer-noassert': 'off',
        'security/detect-child-process': 'off',
        'security/detect-disable-mustache-escape': 'off',
        'security/detect-eval-with-expression': 'off',
        'security/detect-new-buffer': 'off',
        'security/detect-no-csrf-before-method-override': 'off',
        'security/detect-non-literal-fs-filename': 'off',
        'security/detect-non-literal-regexp': 'off',
        'security/detect-non-literal-require': 'off',
        'security/detect-object-injection': 'off',
        'security/detect-possible-timing-attacks': 'off',
        'security/detect-pseudoRandomBytes': 'off',
        'security/detect-unsafe-regex': 'off',
      },
    },
  ],
};
