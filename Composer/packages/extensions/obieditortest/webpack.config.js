const path = require('path');

const autoprefixer = require('autoprefixer');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
      {
        test: /\.(gif|png|webp)$/,
        loader: 'url-loader',
        options: {
          limit: 1,
          name: '[name].[hash:8].[ext]',
        },
      },
      { test: /\.svg$/, loader: 'url-loader', options: { limit: 1, name: '[name].[hash:8].[ext]' } },
      { test: /\.jpe?g$/, loader: 'url-loader', options: { limit: 1, name: '[name].[hash:8].[ext]' } },
      {
        test: /\.(eot|otf|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: { limit: 1, name: '[name].[hash:8].[ext]' },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              hmr: true,
              sourceMap: true,
            },
          },
          { loader: 'css-loader', options: { importLoaders: 1 } },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                autoprefixer({
                  browsers: ['>1%', 'last 2 versions', 'not ie < 11'],
                }),
              ],
            },
          },
        ],
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              hmr: true,
              sourceMap: true,
            },
          },
          { loader: 'css-loader', options: { importLoaders: 1 } },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                autoprefixer({
                  browsers: ['>1%', 'last 2 versions', 'not ie < 11'],
                }),
              ],
            },
          },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },

  output: {
    path: path.join(__dirname, './dist'),
    filename: 'myUnflappableComponent.js',
    library: 'demo',
    libraryTarget: 'umd',
    publicPath: '/dist/',
    umdNamedDefine: true,
  },

  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React',
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM',
    },
  },
};
