module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['../../../.eslintrc.react.js', 'plugin:@typescript-eslint/recommended'],
  rules: {
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],
  },
};
