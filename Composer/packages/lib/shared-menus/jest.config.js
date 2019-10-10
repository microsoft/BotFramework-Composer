module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(j|t)sx?$': 'babel-jest',
  },
  watchPathIgnorePatterns: ['<rootDir>/__tests__/mocks'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/controllers/*.{js,jsx,ts,tsx}'],
  moduleNameMapper: {
    // Any imports of .scss / .css files will instead import styleMock.js which is an empty object
    '\\.(jpg|jpeg|png|svg)$': '<rootDir>/__tests__/jestMocks/styleMock.js',
    '\\.(s)?css$': '<rootDir>/__tests__/jestMocks/styleMock.js',
  },
};
