import { useReducer, Dispatch } from 'react';

import reducer from '../reducers';

import { initialStore, StoreState } from './store';

const applyMiddleware = (fn, middleware?): Dispatch<{ type: any; payload: any }> => {
  if (typeof fn !== 'function') return action => {};

  if (typeof middleware === 'function') {
    return (...params) => {
      middleware(...params);
      return fn(...params);
    };
  }
  return fn;
};

const useStore = (dispatchMiddleware?: (action: { type: any; payload: any }) => void) => {
  const [state, dispatch] = useReducer(reducer, initialStore);

  return { state: state as StoreState, dispatch: applyMiddleware(dispatch, dispatchMiddleware) };
};

export default useStore;
