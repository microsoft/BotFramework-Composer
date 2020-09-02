const { resolve } = require('path');

module.exports = {
  entry: {
    'react-dom-bundle': 'react-dom',
  },
  mode: 'production',
  // export react-dom globally under a variable named ReactDOM
  output: {
    path: resolve(__dirname, '../public'),
    library: 'ReactDOM',
    libraryTarget: 'var',
  },
  externals: {
    // ReactDOM depends on React, but we need this to resolve to the globally-exposed React variable in react-bundle.js (created by webpack-react.config.js).
    // If we don't do this, ReactDom will bundle its own copy of React and we will have 2 copies which breaks hooks.
    react: 'React',
  },
  resolve: {
    extensions: ['.js'],
  },
};
