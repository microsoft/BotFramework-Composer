const { withNodeDefaults } = require('../webpack.config.shared');

module.exports = withNodeDefaults({
  entry: {
    extension: './src/index.ts',
  },
  context: __dirname,
  resolve: {
    alias: {
      // Support lsp code editor
      vscode: require.resolve('monaco-languageclient/lib/vscode-compatibility'),
    },
  },
});
