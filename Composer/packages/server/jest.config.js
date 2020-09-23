const path = require('path');

const { createConfig } = require('@bfc/test-utils');

module.exports = createConfig('server', 'node', {
  setupFiles: [path.resolve(__dirname, 'src/__tests__/setupEnv.ts')],
  testPathIgnorePatterns: ['src/__tests__/setupEnv.ts'],
});
