import { createContext } from 'react';

import { initialStore } from './store';

export const StoreContext = createContext({
  state: initialStore,
  dispatch: action => {},
});
