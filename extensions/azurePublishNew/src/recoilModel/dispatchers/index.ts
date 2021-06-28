// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { resourceConfigurationDispatcher } from './resourceConfigurationDispatcher';
import { userInfoDispatcher } from './userInfoDispatcher';
import { importConfigurationDispatcher } from './importConfigurationDispatcher';
import { handOffToAdminDispatcher } from './handOffToAdminDispatcher';

const createDispatchers = () => {
  return {
    ...resourceConfigurationDispatcher(),
    ...userInfoDispatcher(),
    ...importConfigurationDispatcher(),
    ...handOffToAdminDispatcher(),
  };
};

export default createDispatchers;
export type Dispatcher = ReturnType<typeof createDispatchers>;
