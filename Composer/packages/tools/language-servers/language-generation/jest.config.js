const { createConfig } = require('@bfc/test-utils');

module.exports = createConfig('lsp-lg', 'node', {
  testPathIgnorePatterns: ['/helpers/'],
});
