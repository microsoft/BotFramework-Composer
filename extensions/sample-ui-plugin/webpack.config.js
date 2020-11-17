const { withNodeDefaults, withBrowserDefaults } = require('../webpack.config.shared');

module.exports = [
  withBrowserDefaults({
    entry: {
      publish1: './src/ui/publish/publish1.tsx',
      publish2: './src/ui/publish/publish1.tsx',
      page: './src/ui/page/index.tsx',
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
