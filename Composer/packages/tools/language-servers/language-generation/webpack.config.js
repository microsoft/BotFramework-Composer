/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const path = require('path');
const dist = path.resolve(__dirname, 'lib');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const common = {
  entry: {
    startSampleClient: path.resolve(__dirname, 'src/startSampleClient.ts'),
    'editor.worker': 'monaco-editor-core/esm/vs/editor/editor.worker.js',
  },
  output: {
    filename: '[name].js',
    path: dist,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  target: 'web',
  node: {
    fs: 'empty',
    child_process: 'empty',
    net: 'empty',
    crypto: 'empty',
  },
  resolve: {
    alias: {
      vscode: require.resolve('monaco-languageclient/lib/vscode-compatibility'),
    },
  },
};

if (process.env['NODE_ENV'] === 'production') {
  module.exports = merge(common, {
    plugins: [
      new UglifyJSPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ],
  });
} else {
  module.exports = merge(common, {
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          loader: 'source-map-loader',
        },
      ],
    },
  });
}
