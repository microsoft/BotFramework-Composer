const { withNodeDefaults } = require('../webpack.config.shared');

module.exports = withNodeDefaults({
  entry: {
    extension: './src/index.ts',
  },
  context: __dirname,
});
