// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';
const { resolve } = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/ui/index.tsx',
  mode: 'production',
  output: {
    filename: 'publish.js',
    path: resolve(__dirname, 'lib'),
  },
  externals: {
    // expect react & react-dom to be available in the extension host iframe
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  module: {
    rules: [{ test: /\.tsx?$/, use: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    alias: {
      // Support lsp code editor
      vscode: require.resolve('monaco-languageclient/lib/vscode-compatibility'),
    },
  },
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    module: 'empty',
    dgram: 'empty',
    dns: 'mock',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui/index.html',
    }),
  ],
};
