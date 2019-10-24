module.exports = {
  env: {
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
        '@babel/preset-typescript',
        '@emotion/babel-preset-css-prop',
      ],
      plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-transform-runtime'],
    },
  },
};
