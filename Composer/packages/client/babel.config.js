module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['@babel/plugin-proposal-unicode-property-regex', '@babel/plugin-transform-unicode-regex'],
      },
    ],
    'react-app',
    '@emotion/babel-preset-css-prop',
  ],
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
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: 'commonjs',
            targets: {
              node: 'current',
            },
          },
        ],
        '@babel/preset-react',
        '@emotion/babel-preset-css-prop',
      ],
      plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-transform-runtime'],
    },
  },
};
