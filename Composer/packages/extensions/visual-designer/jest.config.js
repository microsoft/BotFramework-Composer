module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(j|t)sx?$': 'babel-jest',
  },
};
