module.exports = {
  presets: ['react-app', '@emotion/babel-preset-css-prop'],
  env: {
    development: {
      presets: [
        [
          '@emotion/babel-preset-css-prop',
          {
            sourceMap: true,
          },
        ],
      ],
    },
  },
};
