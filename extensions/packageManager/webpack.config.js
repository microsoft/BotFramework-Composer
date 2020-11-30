// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = [{
  entry: {
    "package-manager": "./src/client/Library.tsx",
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
    rules: [{ test: /\.tsx?$/, use: "ts-loader" }],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
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