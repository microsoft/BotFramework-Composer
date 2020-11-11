// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = [
  {
    entry: {
      page: './src/client/page/index.tsx',
      publish1: './src/client/publish/publish1.tsx',
      publish2: './src/client/publish/publish2.tsx',
    },
    mode: 'production',
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'lib', 'client'),
    },
    externals: {
      // expect react & react-dom to be available in the extension host iframe globally under "React" and "ReactDOM" variables
      react: 'React',
      'react-dom': 'ReactDOM',
      '@bfc/extension-client': 'ExtensionClient',
    },
    module: {
      rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: [/node_modules/] }],
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.json'],
    },
  },
  {
    entry: './src/node/index.ts',
    mode: 'production',
    devtool: 'source-map',
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'lib', 'node'),
      filename: 'index.js',
      libraryTarget: 'commonjs2',
    },
    module: {
      rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: [/node_modules/] }],
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.json'],
    },
  },
];
