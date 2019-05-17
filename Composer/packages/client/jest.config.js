module.exports = {
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  moduleNameMapper: {
    // Any imports of .scss / .css files will instead import styleMock.js which is an empty object
    '\\.(jpg|jpeg|png|svg)$': '<rootDir>/__tests__/jestMocks/styleMock.js',
    '\\.(s)?css$': '<rootDir>/__tests__/jestMocks/styleMock.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '/jestMocks/'],
  transform: {
    '^.+\\.(j|t)sx?$': 'babel-jest',
  },
  // Some node modules are packaged and distributed in a non-transpiled form
  // (ex. contain import & export statements); and Jest won't be able to
  // understand them because node_modules aren't transformed by default. So
  // we can specify that they need to be transformed here.
  transformIgnorePatterns: ['"/node_modules/(?!office-ui-fabric-react).+\\.js$"'],

  setupFilesAfterEnv: ['./setupTests.js'],
};
