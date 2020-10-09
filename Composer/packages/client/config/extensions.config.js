const path = require('path');

const PnpWebpackPlugin = require('pnp-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const paths = require('./paths');

module.exports = (webpackEnv) => {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  return [
    {
      entry: {
        'react-bundle': 'react',
      },
      mode: isEnvProduction ? 'production' : 'development',
      // export react globally under a variable named React
      output: {
        path: path.resolve(__dirname, '../public'),
        library: 'React',
        libraryTarget: 'var',
      },
      resolve: {
        extensions: ['.js'],
      },
      optimization: {
        minimize: isEnvProduction,
        minimizer: [
          new TerserPlugin({
            extractComments: false,
          }),
        ],
      },
    },
    {
      entry: {
        'react-dom-bundle': 'react-dom',
      },
      mode: isEnvProduction ? 'production' : 'development',
      // export react-dom globally under a variable named ReactDOM
      output: {
        path: path.resolve(__dirname, '../public'),
        library: 'ReactDOM',
        libraryTarget: 'var',
      },
      externals: {
        // ReactDOM depends on React, but we need this to resolve to the globally-exposed React variable in react-bundle.js (created by extensions.config.js).
        // If we don't do this, ReactDom will bundle its own copy of React and we will have 2 copies which breaks hooks.
        react: 'React',
      },
      resolve: {
        extensions: ['.js'],
      },
      optimization: {
        minimize: isEnvProduction,
        minimizer: [
          new TerserPlugin({
            extractComments: false,
          }),
        ],
      },
    },
    {
      mode: isEnvProduction ? 'production' : 'development',
      entry: {
        'plugin-host-preload': path.resolve(__dirname, '../extension-container/plugin-host-preload.tsx'),
      },
      output: {
        path: path.resolve(__dirname, '../public'),
      },
      externals: {
        // expect react & react-dom to be available in the extension host iframe globally under "React" and "ReactDOM" variables
        react: 'React',
        'react-dom': 'ReactDOM',
      },
      resolve: {
        extensions: ['.js'],
        plugins: [PnpWebpackPlugin],
      },
      resolveLoader: {
        plugins: [
          // Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
          // from the current package.
          PnpWebpackPlugin.moduleLoader(module),
        ],
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: require.resolve('ts-loader'),
            include: [path.resolve(__dirname, '../extension-container')],
            options: PnpWebpackPlugin.tsLoaderOptions({
              transpileOnly: true,
              configFile: path.resolve(__dirname, '../tsconfig.build.json'),
            }),
          },
        ],
      },
    },
  ];
};
