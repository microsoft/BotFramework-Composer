const { resolve } = require('path');

function getWebpackConfigs() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return [
    {
      entry: './src/node/index.ts',
      mode: isDevelopment ? 'development' : 'production',
      target: 'node',
      devtool: isDevelopment ? 'source-map' : undefined,
      output: {
        path: resolve(__dirname, 'lib', 'node'),
        filename: 'index.js',
        libraryTarget: 'commonjs2',
        /**
         * Node files aren't being loaded by Webpack, so we want the source maps to point to the files on disk
         */
        devtoolModuleFilenameTemplate: isDevelopment ? '[absolute-resource-path]' : undefined,
      },
      module: {
        rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: [/node_modules/] }],
      },
      resolve: {
        extensions: ['.js', '.ts'],
      },
    },
  ];
}

module.exports = getWebpackConfigs();
