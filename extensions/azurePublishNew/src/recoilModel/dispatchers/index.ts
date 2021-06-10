// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { resourceConfigurationDispatcher } from './resourceConfigurationDispatcher';

const useDispatchers = () => {
  return {
    ...resourceConfigurationDispatcher(),
  };
};

export default useDispatchers;
