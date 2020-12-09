// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
'use strict';
const { resolve } = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
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
    },
    module: {
      rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: [/node_modules/] }],
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.json'],
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
