module.exports = {
  extends: [
    '../../../.eslintrc.js',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/explicit-member-accessibility': 'off',
  },
};
