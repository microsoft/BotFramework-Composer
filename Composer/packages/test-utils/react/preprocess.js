// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = require('babel-jest').createTransformer({
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        modules: 'commonjs',
        targets: {
          node: 'current',
        },
      },
    ],
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-typescript'),
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve('@babel/plugin-proposal-optional-chaining'),
    require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
  ],
});
