const { withNodeDefaults, withBrowserDefaults } = require('../webpack.config.shared');

module.exports = [
  withBrowserDefaults({
    entry: {
      'publish-bundle': './src/ui/index.tsx',
    },
    context: __dirname,
  }),
  withNodeDefaults({
    entry: {
      extension: './src/node/index.ts',
    },
    context: __dirname,
  }),
];
