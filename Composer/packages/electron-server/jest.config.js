const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('electron-server', 'node', {
  setupFilesAfterEnv: ['./__tests__/setupTests.js'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setupTests.js', 'dist'],
  modulePathIgnorePatterns: ['dist'],
});
