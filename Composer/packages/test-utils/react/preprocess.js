// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = require('babel-jest').createTransformer({
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
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
  ],
});
