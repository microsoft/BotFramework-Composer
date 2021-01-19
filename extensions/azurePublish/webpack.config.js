const { withNodeDefaults, withBrowserDefaults } = require('../webpack.config.shared');

module.exports = [
  withNodeDefaults({
    entry: {
      extension: './src/node/index.ts',
    },
    context: __dirname,
  }),
  withBrowserDefaults({
    entry: {
      publish: './src/ui/index.tsx',
    },
    context: __dirname,
    resolve: {
      alias: {
        // Support lsp code editor
        vscode: require.resolve('monaco-languageclient/lib/vscode-compatibility'),
      },
    },
    node: {
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    },
  }),
];
