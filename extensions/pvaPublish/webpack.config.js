const { resolve } = require('path');
const svgToMiniDataURI = require('mini-svg-data-uri');

module.exports = {
  entry: './src/ui/index.tsx',
  mode: 'production',
  output: {
    filename: 'publish-bundle.js',
    path: resolve(__dirname, 'lib', 'ui'),
  },
  externals: {
    // expect react & react-dom to be available in the extension host iframe
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.ui.json',
        },
      },
      {
        test: /\.svg$/i,
        loader: 'url-loader',
        options: {
          generator: (content) => svgToMiniDataURI(content.toString()),
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  plugins: [],
};
