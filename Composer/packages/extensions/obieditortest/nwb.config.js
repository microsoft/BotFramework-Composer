const fs = require('fs');
const path = require('path');

module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: false,
  },
  webpack: {
    config(c) {
      console.log(c);
      process.exit(1);
      return c;
    },
  },
};
