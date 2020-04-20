// eslint-disable-next-line
const path = require('path');
module.exports = {
  displayName: 'electron-server',
  preset: 'ts-jest/presets/js-with-ts',
  // transform: {
  //   '^.+\\.tsx?$': 'ts-jest',
  //   '^.+\\.jsx?$': 'babel-jest',
  // },
  moduleNameMapper: {},
  testPathIgnorePatterns: ['/node_modules/', '/resources/', '/scripts/', '.*\\.d\\.ts'],
  // Some node modules are packaged and distributed in a non-transpiled form
  // (ex. contain import & export statements); and Jest won't be able to
  // understand them because node_modules aren't transformed by default. So
  // we can specify that they need to be transformed here.
  transformIgnorePatterns: ['/node_modules/'],

  setupFilesAfterEnv: [],
  globals: {
    'ts-jest': {
      tsConfig: path.resolve(__dirname, './tsconfig.json'),
      diagnostics: false,
    },
  },
};
