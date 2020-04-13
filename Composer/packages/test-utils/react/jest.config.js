// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');

const mergeConfig = require('../mergeConfig');
const baseConfig = require('../base/jest.config');

module.exports = mergeConfig(baseConfig, {
  transform: {
    '^.+\\.jsx?$': path.resolve(__dirname, 'preprocess.js'),
    '^.+\\.tsx?$': path.resolve(__dirname, 'preprocess.js'),
  },

  moduleNameMapper: {
    // Any imports of .scss / .css files will instead import styleMock.js which is an empty object
    '\\.(jpg|jpeg|png|svg|gif)$': path.resolve(__dirname, '../mocks/styleMock.js'),
    '\\.(s)?css$': path.resolve(__dirname, '../mocks/styleMock.js'),

    // lsp code editor
    vscode$: 'monaco-languageclient/lib/vscode-compatibility',

    // use commonjs modules for test so they do not need to be compiled
    'office-ui-fabric-react/lib/(.*)$': 'office-ui-fabric-react/lib-commonjs/$1',
    '@uifabric/fluent-theme/lib/(.*)$': '@uifabric/fluent-theme/lib-commonjs/$1',
  },

  setupFilesAfterEnv: [path.resolve(__dirname, 'setup.js')],
});
