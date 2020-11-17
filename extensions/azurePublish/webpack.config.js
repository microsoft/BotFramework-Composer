const { resolve } = require('path');
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  entry: './src/index.ts',
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
};