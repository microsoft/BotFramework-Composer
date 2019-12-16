module.exports = {
  extends: ['../../../.eslintrc.react.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'node/no-missing-import': 'off',
    'node/no-extraneous-import': 'off',
  },
};
