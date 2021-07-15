// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import mergeConfig from '../mergeConfig';
import baseConfig from '../base/jest.config';

export default mergeConfig(baseConfig, {
  testEnvironment: 'jsdom',

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
