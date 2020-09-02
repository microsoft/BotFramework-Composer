const { resolve } = require('path');

module.exports = {
  entry: {
    page: './src/client/page/index.tsx',
    publish: './src/client/publish/index.tsx',
  },
  mode: 'production',
  output: {
    path: resolve(__dirname, 'dist'),
  },
  externals: {
    // expect react & react-dom to be available in the extension host iframe globally under "React" and "ReactDOM" variables
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  module: {
    rules: [{ test: /\.tsx?$/, use: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
};
