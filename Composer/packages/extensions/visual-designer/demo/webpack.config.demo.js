/* eslint-disable */
const path = require('path');

const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3001,
    stats: 'errors-only',
  },
  node: {
    fs: 'empty',
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
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
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({ configFile: path.resolve(__dirname, './tsconfig.json') })],
  },

  output: {
    filename: '[name].[chunkhash:8].js',
    chunkFilename: '[name].[chunkhash:8].js',
    path: path.resolve('./demo/dist'),
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new HtmlWebpackPlugin({
      title: 'Visual Designer',
      chunksSortMode: 'dependency',
      template: path.join(__dirname, 'index.html'),
    }),
  ],
};
