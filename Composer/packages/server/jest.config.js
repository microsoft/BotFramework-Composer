const path = require('path');

const { createConfig } = require('@bfc/test-utils');

module.exports = createConfig('server', 'node', {
  setupFiles: [path.resolve(__dirname, '__tests__/setupEnv.ts')],
  testPathIgnorePatterns: ['__tests__/setupEnv.ts'],
});
