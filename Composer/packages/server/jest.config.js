const path = require('path');

module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  testPathIgnorePatterns: ['/node_modules/'],
  watchPathIgnorePatterns: ['<rootDir>/__tests__/mocks'],
  globals: {
    'ts-jest': {
      tsConfig: path.resolve(__dirname, './tsconfig.json'),
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
