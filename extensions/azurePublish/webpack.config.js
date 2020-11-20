// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
'use strict';
const { resolve } = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  {
    entry: './src/ui/index.tsx',
    mode: 'production',
    output: {
      filename: 'publish.js',
      path: resolve(__dirname, 'lib', 'ui'),
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      'office-ui-fabric-react': 'Fabric',
    },
    module: {
      rules: [
        { test: /\.tsx?$/, use: 'ts-loader' },
        {
          test: /\.svg$/i,
          use: [
            {
              loader: 'url-loader',
            },
          ],
        },
      ],
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
    }
  },
  {
    entry: './src/node/index.ts',
    mode: 'production',
    devtool: 'source-map',
    target: 'node',
    node: {
      __dirname: false,
      __filename: false,
      global: false,
    },
    output: {
      path: resolve(__dirname, 'lib', 'node'),
      filename: 'index.js',
      libraryTarget: 'commonjs2',
      /**
       * Node files aren't being loaded by Webpack, so we want the source maps to point to the files on disk
       */
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    },
    module: {
      rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: [/node_modules/] }],
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.json'],
      mainFields: ['main'],
    },
    optimization:  {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_fnames: /AbortSignal/,
          },
        }),
      ],
    }
  }
];
