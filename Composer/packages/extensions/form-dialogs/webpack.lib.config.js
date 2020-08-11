'use strict';

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  stats: 'errors-only',

  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.jsx'],
    modules: [path.resolve('.'), 'node_modules'],
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: path.resolve(__dirname, 'node_modules'),
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: path.join(__dirname, './tsconfig.lib.json'),
        },
        exclude: path.resolve(__dirname, 'node_modules'),
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },

  entry: './src/app/VisualSchemaEditor.tsx',

  output: {
    path: path.join(__dirname, 'lib'),
    libraryTarget: 'commonjs',
    filename: 'index.js',
  },

  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    lodash: 'lodash',
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].min.css',
    }),
  ],

  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
};
