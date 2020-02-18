const path = require('path');

module.exports = {
  displayName: 'indexers',
  preset: 'ts-jest/presets/js-with-babel',
  testPathIgnorePatterns: ['/node_modules/'],
  watchPathIgnorePatterns: ['<rootDir>/__tests__/mocks'],
  moduleNameMapper: {
    // Any imports of .scss / .css files will instead import styleMock.js which is an empty object
    '\\.(jpg|jpeg|png|svg)$': '<rootDir>/__tests__/jestMocks/styleMock.js',
    '\\.(s)?css$': '<rootDir>/__tests__/jestMocks/styleMock.js',
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
