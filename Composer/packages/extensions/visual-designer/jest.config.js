// eslint-disable-next-line
const path = require('path');

module.exports = {
  displayName: 'visual-designer',
  preset: 'ts-jest/presets/js-with-babel',
  testPathIgnorePatterns: ['"/node_modules/(?!office-ui-fabric-react).+\\.js$"', '/node_modules/', '/jestMocks/'],
  moduleNameMapper: {
    // Any imports of .scss / .css files will instead import styleMock.js which is an empty object
    '\\.(s)?css$': '<rootDir>/__tests__/jestMocks/styleMock.ts',
    // READ: https://github.com/OfficeDev/office-ui-fabric-react/blob/master/6.0_RELEASE_NOTES.md#lib-commonjs
    'office-ui-fabric-react/lib/(.*)$': 'office-ui-fabric-react/lib-commonjs/$1',
  },
  globals: {
    'ts-jest': {
      tsConfig: path.resolve(__dirname, './tsconfig.json'),
      diagnostics: false,
    },
  },
};
