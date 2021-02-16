// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { resolve } = require('path');
const { DefinePlugin } = require('webpack');

module.exports = {
  entry: './src/node/index.ts',
  mode: 'production',
  devtool: 'source-map',
  target: 'node',
  node: {
    __dirname: false,
  },
  output: {
    path: resolve(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: [/node_modules/] }],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
    mainFields: ['main'],
  },
  plugins: [
    // reference: https://github.com/node-formidable/formidable/issues/337#issuecomment-153408479
    new DefinePlugin({ 'global.GENTLY': false })
  ]
};
