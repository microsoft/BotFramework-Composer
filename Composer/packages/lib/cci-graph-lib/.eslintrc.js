const path = require('path');

module.exports = {
  extends: [
    '../../../.eslintrc.react.js',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json'),
  },
  rules: {
    '@typescript-eslint/explicit-member-accessibility': 'off',
  },
};
