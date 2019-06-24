module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: false,
  },
  webpack: {
    extra: {
      module: {
        rules: [
          { test: /\.dialog/, loader: 'json-loader' },
          { test: /\.tsx?$/, loader: 'ts-loader' },
          { test: /\.js$/, loader: 'source-map-loader' },
        ],
      },
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
      },
    },
  },
};
