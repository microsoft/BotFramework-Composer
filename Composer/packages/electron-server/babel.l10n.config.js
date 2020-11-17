// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  presets: ['@babel/react', ['@babel/typescript', { allowNamespaces: true }]],
  plugins: ['@babel/plugin-proposal-class-properties'],
  ignore: ['**/__tests__', 'node_modules/**', 'build/**/*.js', 'dist/**'],
};
