const withDefaults = require('../webpack.config.shared');

module.exports = withDefaults({
  entry: { extension: './index.js' },
  context: __dirname,
});
