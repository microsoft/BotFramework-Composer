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
      ],
      plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-transform-runtime'],
    },
  },
};
