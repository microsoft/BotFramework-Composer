const path = require('path');

module.exports = {
  displayName: 'server',
  preset: 'ts-jest/presets/js-with-babel',
  testPathIgnorePatterns: ['/node_modules/'],
  watchPathIgnorePatterns: ['<rootDir>/__tests__/mocks'],

  moduleNameMapper: {
    // allow tests to import src code from '@src'
    '^@src/(.*)$': '<rootDir>/src/$1',
  },

  globals: {
    'ts-jest': {
      tsConfig: path.resolve(__dirname, './tsconfig.json'),
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
