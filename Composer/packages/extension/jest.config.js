const path = require('path');

const { createConfig } = require('@bfc/test-utils');

module.exports = createConfig('extension', 'node', {
  setupFiles: [path.resolve(__dirname, 'src/__tests__/setupEnv.ts')],
  setupFilesAfterEnv: [path.resolve(__dirname, 'src/__tests__/setupTests.ts')],
  testPathIgnorePatterns: ['src/__tests__/setupEnv.ts', 'src/__tests__/setupTests.ts'],
});
