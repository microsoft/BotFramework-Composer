module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: false,
  },
  webpack: {
    extra: {
      module: {
        rules: [{ test: /\.dialog/, loader: 'json-loader' }],
      },
    },
  },
};
