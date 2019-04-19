module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  plugins: ['import', 'notice'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    // eslint rules
    'no-dupe-class-members': 'off',
    'no-undef': 'off', // ts compiler catches this
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'dot-notation': 'error',
    yoda: 'error',
    eqeqeq: 'warn',

    // plugin: import
    'import/first': 'error',
    'import/order': ['error', { 'newlines-between': 'always' }],
  },
  overrides: [
    {
      files: ['**/*.+(ts|tsx)'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'prettier'],
      rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': [
          'warn',
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
          },
        ],
      },
    },
    {
      files: ['**/*.+(js|jsx)'],
      parser: 'babel-eslint',
    },
    {
      files: ['**/*.+(test|spec).+(js|jsx|ts|tsx)'],
      env: {
        jest: true,
      },
      rules: {
        'typescript/class-name-casing': 'off',
        'typescript/no-explicit-any': 'off',
        '@typescript-eslint/no-object-literal-type-assertion': 'off',
      },
    },
  ],
};
