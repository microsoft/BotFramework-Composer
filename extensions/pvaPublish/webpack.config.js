const { resolve } = require('path');
const svgToMiniDataURI = require('mini-svg-data-uri');

function getWebpackConfigs() {
  switch (process.env.NODE_ENV) {
    case 'development':
      // in the case of development, we want to skip webpack for node compilation and use TSC so we get working sourcemaps
      console.log('[pvaPublish] Generating development bundles.');
      return [
        {
          entry: './src/ui/index.tsx',
          mode: 'development',
          devtool: 'source-map',
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
      ];

    case 'production':
    default:
      console.log('[pvaPublish] Generating production bundles.');
      return [
        {
          entry: './src/ui/index.tsx',
          mode: 'production',
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
          mode: 'production',
          target: 'node',
          output: {
            path: resolve(__dirname, 'lib', 'node'),
            filename: 'index.js',
            libraryTarget: 'commonjs2',
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
}

module.exports = getWebpackConfigs();
