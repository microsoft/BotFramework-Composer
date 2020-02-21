module.exports = {
  extends: ['./.eslintrc.js', 'plugin:react/recommended'],
  plugins: ['react-hooks', 'format-message', 'emotion'],
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

    // emotion
    'emotion/jsx-import': 'error',
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
