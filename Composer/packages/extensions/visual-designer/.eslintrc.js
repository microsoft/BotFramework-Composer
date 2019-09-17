module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['../../../.eslintrc.react.js', 'plugin:@typescript-eslint/recommended'],
  rules: {
    indent: 'off',
    '@typescript-eslint/indent': ['warn', 2],
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-use-before-define': ['warn', { functions: false, classes: true }],
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
