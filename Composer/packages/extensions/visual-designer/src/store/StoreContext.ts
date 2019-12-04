// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { createContext } from 'react';

import { initialStore } from './store';

export const StoreContext = createContext({
  state: initialStore,
  dispatch: action => {},
});
