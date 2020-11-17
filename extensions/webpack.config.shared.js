const path = require('path');

const merge = require('merge-options');
const TerserPlugin = require('terser-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');

const isDevelopment = process.env.NODE_ENV !== 'production';

function withNodeDefaults(extConfig) {
  if (!extConfig.context) {
    throw new Error('Must set context (usually to __dirname)');
  }

  const defaultConfig = {
    mode: isDevelopment ? 'development' : 'production',
    target: 'node',
    devtool: 'source-map',
    node: {
      __dirname: false,
    },
    output: {
      path: path.join(extConfig.context, 'dist'),
      filename: '[name].js',
      libraryTarget: 'commonjs2',
      /**
       * Node files aren't being loaded by Webpack, so we want the source maps to point to the files on disk
       */
      devtoolModuleFilenameTemplate: isDevelopment ? '[absolute-resource-path]' : undefined,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: { loader: 'ts-loader', options: { compilerOptions: { sourceMaps: true } } },
          exclude: [/node_modules/],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.ts', '.json'],
      mainFields: ['main'],
    },
    externals: {
      '@botframework-composer/types': 'commonjs @botframework-composer/types',
    },
    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            keep_fnames: /AbortSignal/,
            format: {
              comments: false,
            },
          },
        }),
      ],
    },
  };

  return merge(defaultConfig, extConfig);
}

function withBrowserDefaults(extConfig) {
  if (!extConfig.context) {
    throw new Error('Must set context (usually to __dirname)');
  }

  const defaultConfig = {
    mode: isDevelopment ? 'development' : 'production',
    devtool: 'source-map',
    output: {
      path: path.join(extConfig.context, 'dist', 'ui'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: { loader: 'ts-loader', options: { compilerOptions: { sourceMaps: true } } },
          exclude: [/node_modules/],
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
      extensions: ['.js', '.ts', '.tsx', '.json'],
      mainFields: ['main'],
    },
    externals: {
      // expect react & react-dom to be available in the extension host iframe globally under "React" and "ReactDOM" variables
      react: 'React',
      'react-dom': 'ReactDOM',
      '@bfc/extension-client': 'ExtensionClient',
    },
    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            format: {
              comments: false,
            },
          },
        }),
      ],
    },
  };

  return merge(defaultConfig, extConfig);
}

module.exports = withNodeDefaults;
module.exports.withNodeDefaults = withNodeDefaults;
module.exports.withBrowserDefaults = withBrowserDefaults;
