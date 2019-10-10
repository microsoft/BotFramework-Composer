module.exports = {
  extends: [
    './.eslintrc.base.js',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier/@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/ban-ts-ignore': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-use-before-define': 'warn',
  },
  parserOptions: {
    // temp fix for https://github.com/typescript-eslint/typescript-eslint/issues/864
    createDefaultProgram: true,
  },
};
