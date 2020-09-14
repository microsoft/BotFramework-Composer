const { resolve } = require('path');

module.exports = {
  entry: {
    'react-bundle': 'react',
  },
  mode: 'production',
  // export react globally under a variable named React
  output: {
    path: resolve(__dirname, '../public'),
    library: 'React',
    libraryTarget: 'var',
  },
  resolve: {
    extensions: ['.js'],
  },
};
