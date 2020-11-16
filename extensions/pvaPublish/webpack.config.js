const { resolve } = require('path');
const svgToMiniDataURI = require('mini-svg-data-uri');

function getWebpackConfigs() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  console.log(`[pvaPublish] Generating ${isDevelopment ? 'development' : 'production'} bundles.`);

  return [
    {
      entry: './src/ui/index.tsx',
      mode: isDevelopment ? 'development' : 'production',
      devtool: isDevelopment ? 'source-map' : undefined,
      output: {
        filename: 'publish-bundle.js',
        path: resolve(__dirname, 'lib', 'ui'),
      },
      externals: {
        // expect react & react-dom to be available in the extension host iframe
        react: 'React',
        'react-dom': 'ReactDOM',
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
          },
          {
            test: /\.svg$/i,
            loader: 'url-loader',
            options: {
              generator: (content) => svgToMiniDataURI(content.toString()),
            },
          },
        ],
      },
      resolve: {
        extensions: ['.js', '.ts', '.tsx'],
      },
      plugins: [],
    },
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
        rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: [/node_modules/] }],
      },
      resolve: {
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
  ];
}

module.exports = getWebpackConfigs();
