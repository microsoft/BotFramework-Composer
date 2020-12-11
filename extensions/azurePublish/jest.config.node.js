const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('azurePublish', 'node', {
    testMatch: ['**/?(*.)+(test).ts'],
    verbose: true,
});