const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const SrcPath = path.resolve(__dirname, 'src');
const BuildPath = path.resolve(__dirname, './../../dist');
const ProjPath = __dirname;

module.exports = {
  target: 'node',
  mode: 'production',
  entry: path.resolve(SrcPath, 'server.ts'),
  output: {
    path: BuildPath,
    filename: 'server.js',
  },
  module: {
    rules: [{ test: /\.tsx?$/, exclude: [/node_modules/], loader: 'ts-loader' }],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([
      { from: path.resolve(ProjPath, 'settings.json'), to: BuildPath },
      { from: path.resolve(ProjPath, 'storage.json'), to: BuildPath },
    ]),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
