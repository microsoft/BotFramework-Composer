const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('ui', 'react', {
  testMatch: ['**/?(*.)+(spec).tsx'],
  verbose: true,
  setupFilesAfterEnv: ['./testing/setupUITests.js'],
});
