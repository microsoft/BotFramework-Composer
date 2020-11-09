// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  presets: ['@babel/react', ['@babel/typescript', { allowNamespaces: true }]],
  plugins: ['@babel/plugin-proposal-class-properties'],
  ignore: [
    'packages/electron-server',
    'packages/**/__tests__',
    'packages/**/node_modules',
    'packages/**/build/**/*.js',
  ],
};
