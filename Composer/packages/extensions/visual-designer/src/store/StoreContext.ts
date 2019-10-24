import { createContext } from 'react';

import initialStore from './initialStore';

export const StoreContext = createContext({
  state: initialStore,
  dispatch: action => {},
});
