// eslint-disable-next-line
const path = require('path');
module.exports = {
  displayName: 'client',
  preset: 'ts-jest/presets/js-with-ts',
  // transform: {
  //   '^.+\\.tsx?$': 'ts-jest',
  //   '^.+\\.jsx?$': 'babel-jest',
  // },
  moduleNameMapper: {
    // Any imports of .scss / .css files will instead import styleMock.js which is an empty object
    '\\.(jpg|jpeg|png|svg|gif)$': '<rootDir>/__tests__/jestMocks/styleMock.js',
    '\\.(s)?css$': '<rootDir>/__tests__/jestMocks/styleMock.js',
    // lsp code editor
    vscode$: 'monaco-languageclient/lib/vscode-compatibility',

    // use commonjs modules for test so they do not need to be compiled
    'office-ui-fabric-react/lib/(.*)$': 'office-ui-fabric-react/lib-commonjs/$1',
    '@uifabric/fluent-theme/lib/(.*)$': '@uifabric/fluent-theme/lib-commonjs/$1',

    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/jestMocks/',
    '__mocks__',
    '/testUtils/',
    '__tests__/setupTests.ts',
    '.*\\.d\\.ts',
  ],
  // Some node modules are packaged and distributed in a non-transpiled form
  // (ex. contain import & export statements); and Jest won't be able to
  // understand them because node_modules aren't transformed by default. So
  // we can specify that they need to be transformed here.
  transformIgnorePatterns: ['/node_modules/'],

  setupFilesAfterEnv: [path.resolve(__dirname, './__tests__/setupTests.ts')],
  globals: {
    'ts-jest': {
      tsConfig: path.resolve(__dirname, './tsconfig.json'),
      diagnostics: false,
    },
  },
};
