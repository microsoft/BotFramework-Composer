module.exports = {
  extends: '../../.eslintrc.react.js',
  overrides: [
    {
      files: ['src/serviceWorker.js'],
      rules: {
        'no-console': 'warn',
      },
    },
  ],
};
