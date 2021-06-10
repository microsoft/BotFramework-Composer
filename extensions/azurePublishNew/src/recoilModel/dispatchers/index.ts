// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { resourceConfigurationDispatcher } from './resourceConfigurationDispatcher';
import { userInfoDispatcher } from './userInfoDispatcher';

const createDispatchers = () => {
  return {
    ...resourceConfigurationDispatcher(),
    ...userInfoDispatcher(),
  };
};

export default createDispatchers;
export type Dispatcher = ReturnType<typeof createDispatchers>;
