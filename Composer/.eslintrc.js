module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  plugins: ['import', 'notice'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    // eslint rules
    'no-dupe-class-members': 'off',
    'no-undef': 'off', // ts compiler catches this
    'prefer-const': 'error',
    'no-console': 'warn',

    // plugin: import
    'import/first': 'error',
    'import/order': ['error', { 'newlines-between': 'always' }],
  },
  overrides: [
    {
      files: ['**/*.+(js|jsx)'],
      parser: 'babel-eslint',
    },
    {
      files: ['**/*.+(test|spec).+(js|jsx|ts|tsx)'],
      env: {
        jest: true,
      },
      rules: {
        'typescript/class-name-casing': 'off',
        'typescript/no-explicit-any': 'off',
      },
    },
  ],
};
