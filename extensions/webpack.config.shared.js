const path = require('path');

const merge = require('merge-options');
const TerserPlugin = require('terser-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const { ESBuildPlugin, ESBuildMinifyPlugin } = require('esbuild-loader');

const isDevelopment = process.env.NODE_ENV !== 'production';

const serverPkg = require(path.resolve(__dirname, '../Composer/packages/server/package.json'));
const serverDeps = Object.keys(serverPkg.dependencies).reduce((all, name) => {
  all[name] = `commonjs ${name}`;
  return all;
}, {});

function withNodeDefaults(extConfig) {
  if (!extConfig.context) {
    throw new Error('Must set context (usually to __dirname)');
  }

  const defaultConfig = {
    mode: isDevelopment ? 'development' : 'production',
    target: 'node',
    devtool: 'cheap-module-source-map',
    node: false,
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
          use: ['cache-loader', { loader: 'ts-loader', options: { compilerOptions: { sourceMaps: true } } }],
          exclude: [/node_modules/],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.ts', '.json'],
      mainFields: ['main'],
    },
    externals: serverDeps,
    plugins: [new ESBuildPlugin()],
    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new ESBuildMinifyPlugin({
          minify: !isDevelopment,
          minifyIdentifiers: false,
          target: 'es2015',
        }),
        // new TerserPlugin({
        //   extractComments: false,
        //   terserOptions: {
        //     keep_fnames: /AbortSignal/,
        //     format: {
        //       comments: false,
        //     },
        //   },
        // }),
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
          loader: 'esbuild-loader',
          options: {
            loader: 'tsx',
            target: 'es2015',
          },
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
    plugins: [new ESBuildPlugin()],
    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new ESBuildMinifyPlugin({
          minify: !isDevelopment,
          minifyIdentifiers: false,
          target: 'es2015',
        }),
      ],
    },
  };

  return merge(defaultConfig, extConfig);
}

module.exports = withNodeDefaults;
module.exports.withNodeDefaults = withNodeDefaults;
module.exports.withBrowserDefaults = withBrowserDefaults;
