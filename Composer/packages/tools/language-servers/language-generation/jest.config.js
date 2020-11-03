const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('lsp-lg', 'node', {
  testPathIgnorePatterns: ['/helpers/'],
});
