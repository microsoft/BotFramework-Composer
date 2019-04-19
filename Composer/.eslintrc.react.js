module.exports = {
  extends: ['./.eslintrc.js', 'plugin:react/recommended'],
  plugins: ['react-hooks'],
  settings: {
    react: {
      version: 'detect',
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
    'react/no-deprecated': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',

    'react/prop-types': 'warn',
  },
  overrides: [
    {
      files: ['**/*.+(ts|tsx)'],
      rules: {
        'react/prop-types': 'off'
      }
    },
    {
      files: ['**/*.+(test|spec).+(js|jsx|ts|tsx)'],
      rules: {
        'react/display-name': 'off',
        'react/prop-types': 'off',
      },
    },
  ],
};
