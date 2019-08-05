// eslint-disable-next-line
const path = require('path');
module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  testPathIgnorePatterns: [
    '"/node_modules/(?!office-ui-fabric-react).+\\.js$"',
    '/node_modules/',
    '/jestMocks/',
    '__tests__/index.test.tsx',
  ],
  moduleNameMapper: {
    // Any imports of .scss / .css files will instead import styleMock.js which is an empty object
    '\\.(s)?css$': '<rootDir>/__tests__/jestMocks/styleMock.ts',
  },
  globals: {
    'ts-jest': {
      tsConfig: path.resolve(__dirname, './tsconfig.json'),
      diagnostics: false,
    },
  },
};
