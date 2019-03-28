module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(j|t)sx?$': 'babel-jest',
  },
  watchPathIgnorePatterns: ['<rootDir>/__tests__/mocks'],
};
