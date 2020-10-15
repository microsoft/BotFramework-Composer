const path = require('path');
const { createConfig } = require('@botframework-composer/test-utils');

module.exports = createConfig('client', 'react', {
  setupFilesAfterEnv: [path.resolve(__dirname, 'setupTests.ts')],
  moduleNameMapper: { '\\.worker.ts': '<rootDir>/__tests__/mocks/worker.ts' },
});
