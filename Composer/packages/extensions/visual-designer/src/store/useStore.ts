import { useReducer } from 'react';

import reducer from '../reducers';

import initialState from './initialStore';

const applyMiddleware = (fn, middleware?) => {
  if (typeof fn !== 'function') return () => {};

  if (typeof middleware === 'function') {
    return (...params) => {
      middleware(...params);
      return fn(...params);
    };
  }
  return fn;
};

const useStore = (dispatchMiddleware?: (action: any) => void) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return { state, dispatch: applyMiddleware(dispatch, dispatchMiddleware) };
};

export default useStore;
