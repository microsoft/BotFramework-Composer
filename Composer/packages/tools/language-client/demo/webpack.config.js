const path = require('path');
const client = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const common = {
  mode: 'development',
  entry: {
    main: path.resolve(client, 'main.ts'),
    'editor.worker': 'monaco-editor-core/esm/vs/editor/editor.worker.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: dist,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    contentBase: './dist',
  },
  target: 'web',
  node: {
    fs: 'empty',
    child_process: 'empty',
    net: 'empty',
    tls: 'empty',
    crypto: 'empty',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({ configFile: path.resolve(__dirname, './tsconfig.json') })],
    alias: {
      vscode: require.resolve('monaco-languageclient/lib/vscode-compatibility'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
  ],
};

if (process.env['NODE_ENV'] === 'production') {
  module.exports = merge(common, {
    plugins: [
      new UglifyJSPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ],
  });
} else {
  module.exports = merge(common, {
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          loader: 'source-map-loader',
        },
      ],
    },
  });
}
