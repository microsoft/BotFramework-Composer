// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');

const mergeConfig = require('../mergeConfig');
const baseConfig = require('../base/jest.config');

const babelConfig = {
  presets: [
    require.resolve('@babel/preset-env'),
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-typescript'),
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve('@babel/plugin-proposal-optional-chaining'),
    require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
  ],
};

module.exports = mergeConfig(baseConfig, {
  transform: {
    '^.+\\.jsx?$': [require.resolve('babel-jest'), babelConfig],
    '^.+\\.tsx?$': [require.resolve('babel-jest'), babelConfig],
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
