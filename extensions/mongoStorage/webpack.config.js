const { resolve } = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  devtool: 'source-map',
  target: 'node',
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
};
