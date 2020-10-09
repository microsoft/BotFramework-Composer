const path = require('path');

const PnpWebpackPlugin = require('pnp-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (webpackEnv) => {
  const isEnvProduction = webpackEnv === 'production';

  return {
    mode: isEnvProduction ? 'production' : 'development',
    entry: {
      'plugin-host-preload': path.resolve(__dirname, '../extension-container/plugin-host-preload.tsx'),
    },
    output: {
      path: path.resolve(__dirname, '../public'),
      filename: '[name].js',
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
    optimization: {
      minimize: isEnvProduction,

      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
      ],
    },
  };
};
