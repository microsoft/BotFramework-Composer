// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import mergeConfig from '../mergeConfig';
import baseConfig from '../base/jest.config';

export default mergeConfig(baseConfig, {
  testEnvironment: 'node',
});
