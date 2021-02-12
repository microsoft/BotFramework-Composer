// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [{
  entry: {
    "adaptive-cards-designer": "./src/client/Library.tsx",
  },
  mode: "development",
  devtool: "eval-source-map",
  output: {
    path: path.resolve(__dirname, "lib/pages"),
  },
  externals: {
    // expect react & react-dom to be available in the extension host iframe globally under "React" and "ReactDOM" variables
    react: "React",
    "react-dom": "ReactDOM",
    "@bfc/extension-client": "ExtensionClient",
    "office-ui-fabric-react": "Fabric",
  },
  module: {
    rules: [{ test: /\.tsx?$/, use: "ts-loader" }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }, {
      test: /\.ttf$/,
      use: ['file-loader'],
    },],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".ttf"],
  },
  plugins: [
		new CopyWebpackPlugin({
      patterns: [{
			from: 'node_modules/adaptivecards-designer/dist/containers/*',
			to: 'containers/'
      }
    ]}),
		new MonacoWebpackPlugin({
			languages: ['json']
		})
	]
},
{
  entry: './src/node/index.ts',
  mode: 'production',
  devtool: 'source-map',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'lib', 'node'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: [/node_modules/] }],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
    mainFields: ['main'],
  },
}];
