module.exports = {
  mode: 'production',
  module: {
    rules: [
      {
        test: {},
        loader:
          '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules/babel-loader/lib/index.js',
        exclude: {},
        options: {
          babelrc: false,
          cacheDirectory: true,
          presets: [
            [
              '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/babel-preset-env/lib/index.js',
              {
                loose: true,
                modules: false,
              },
            ],
            '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/babel-preset-react/lib/index.js',
            '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/babel-preset-stage-1/lib/index.js',
          ],
          plugins: [
            '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/babel-plugin-transform-decorators-legacy/lib/index.js',
            [
              '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/babel-plugin-transform-runtime/lib/index.js',
              {
                helpers: false,
                polyfill: false,
                regenerator: true,
                moduleName: '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/babel-runtime',
              },
            ],
            '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/babel-plugin-syntax-dynamic-import/lib/index.js',
          ],
        },
      },
      {
        test: {},
        loader:
          '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules/url-loader/dist/cjs.js',
        options: {
          limit: 1,
          name: '[name].[hash:8].[ext]',
        },
      },
      {
        test: {},
        loader:
          '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules/url-loader/dist/cjs.js',
        options: {
          limit: 1,
          name: '[name].[hash:8].[ext]',
        },
      },
      {
        test: {},
        loader:
          '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules/url-loader/dist/cjs.js',
        options: {
          limit: 1,
          name: '[name].[hash:8].[ext]',
        },
      },
      {
        test: {},
        loader:
          '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules/url-loader/dist/cjs.js',
        options: {
          limit: 1,
          name: '[name].[hash:8].[ext]',
        },
      },
      {
        test: {},
        loader:
          '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules/url-loader/dist/cjs.js',
        options: {
          limit: 1,
          name: '[name].[hash:8].[ext]',
        },
      },
      {
        test: {},
        loader:
          '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules/url-loader/dist/cjs.js',
        options: {
          limit: 1,
          name: '[name].[hash:8].[ext]',
        },
      },
      {
        test: {},
        use: [
          {
            loader:
              '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules/mini-css-extract-plugin/dist/loader.js',
          },
          {
            loader: '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/css-loader/index.js',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader:
              '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules/postcss-loader/lib/index.js',
            options: {
              ident: 'postcss',
              plugins: [null],
            },
          },
        ],
      },
      {
        test: {},
        use: [
          {
            loader:
              '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules/mini-css-extract-plugin/dist/loader.js',
          },
          {
            loader: '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/css-loader/index.js',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader:
              '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules/postcss-loader/lib/index.js',
            options: {
              ident: 'sass-postcss',
              plugins: [null],
            },
          },
          {
            loader: '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/sass-loader/lib/loader.js',
          },
        ],
      },
    ],
    strictExportPresence: true,
  },
  output: {
    filename: '[name].[chunkhash:8].js',
    chunkFilename: '[name].[chunkhash:8].js',
    path: '/Users/abrown/code/BotFramework-Composer/Composer/packages/extensions/obieditortest/demo/dist',
  },
  performance: {
    hints: false,
  },
  optimization: {
    minimize: true,
    minimizer: [{}],
    runtimeChunk: 'single',
  },
  plugins: [
    {
      options: {},
      pathCache: {},
      fsOperations: 0,
      primed: false,
    },
    {
      definitions: {
        'process.env.NODE_ENV': '"production"',
      },
    },
    {
      options: {
        options: {
          context: '/Users/abrown/code/BotFramework-Composer/Composer/packages/extensions/obieditortest',
        },
        test: {},
      },
    },
    {
      options: {
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[name].[contenthash:8].css',
      },
    },
    {
      options: {
        debug: false,
        minimize: true,
        test: {},
      },
    },
    {
      options: {
        template: '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/templates/webpack-template.html',
        filename: 'index.html',
        hash: false,
        inject: true,
        compile: true,
        favicon: false,
        minify: false,
        cache: true,
        showErrors: true,
        chunks: 'all',
        excludeChunks: [],
        chunksSortMode: 'dependency',
        meta: {},
        title: 'obieditortest 1.0.0 Demo',
        xhtml: false,
        mountId: 'demo',
      },
    },
    null,
  ],
  resolve: {},
  resolveLoader: {
    modules: ['node_modules', '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/node_modules'],
  },
  devtool: 'source-map',
  entry: {
    demo: [
      '/Users/abrown/code/BotFramework-Composer/Composer/node_modules/nwb/polyfills.js',
      '/Users/abrown/code/BotFramework-Composer/Composer/packages/extensions/obieditortest/demo/src/index.js',
    ],
  },
};
