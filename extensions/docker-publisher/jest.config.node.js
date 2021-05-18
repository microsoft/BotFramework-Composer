const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('dockerPublish', 'node', {
  testMatch: ['**/?(*.)+(test).ts'],
  verbose: true,
});
