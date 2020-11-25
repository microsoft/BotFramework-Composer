const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('node', 'node', {
  testMatch: ['**/?(*.)+(spec).ts'],
  verbose: true,
});
