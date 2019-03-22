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
      ],
      plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-transform-runtime'],
    },
  },
};
