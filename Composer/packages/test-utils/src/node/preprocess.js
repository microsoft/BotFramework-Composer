// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createTransformer } from 'babel-jest';

module.exports = createTransformer({
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
    require.resolve('@babel/preset-typescript'),
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve('@babel/plugin-proposal-optional-chaining'),
    require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
  ],
});
