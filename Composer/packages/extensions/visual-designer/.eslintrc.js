module.exports = {
  extends: ['../../../.eslintrc.react.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-use-before-define': ['warn', { functions: false, classes: true }],
  },
};
