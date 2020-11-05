const { resolve } = require('path');

module.exports = {
  entry: './index.js',
  mode: 'production',
  devtool: 'source-map',
  target: 'node',
  output: {
    path: resolve(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },
};
