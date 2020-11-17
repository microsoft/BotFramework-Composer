const withDefaults = require('../webpack.config.shared');

module.exports = withDefaults({
  entry: { extension: './src/index.ts' },
  context: __dirname,
});
