// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { resourceConfigurationDispatcher } from './resourceConfigurationDispatcher';
import { userInfoDispatcher } from './userInfoDispatcher';
import { importConfigurationDispatcher } from './importConfigurationDispatcher';

const createDispatchers = () => {
  return {
    ...resourceConfigurationDispatcher(),
    ...userInfoDispatcher(),
    ...importConfigurationDispatcher(),
  };
};

export default createDispatchers;
export type Dispatcher = ReturnType<typeof createDispatchers>;
