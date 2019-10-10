module.exports = {
  extends: [
    './.eslintrc.base.js',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier/@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/no-use-before-define': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    // '@typescript-eslint/interface-name-prefix': 'off',
    // '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // '@typescript-eslint/no-explicit-any': ['warn'],
  },
};
