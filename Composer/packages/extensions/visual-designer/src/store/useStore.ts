// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { useReducer, Dispatch } from 'react';

import { initialStore, StoreState } from './store';

const reducer = action => {
  return initialStore;
};

type Action = { type: string; payload?: any };

const applyMiddleware = (fn, middleware?): Dispatch<Action> => {
  if (typeof fn !== 'function') return () => {};

  if (typeof middleware === 'function') {
    return (...params) => {
      middleware(...params);
      return fn(...params);
    };
  }
  return fn;
};

const useStore = (dispatchMiddleware?: (action: Action) => void) => {
  const [state, dispatch] = useReducer(reducer, initialStore);

  return {
    store: state as StoreState,
    dispatch: applyMiddleware(dispatch, dispatchMiddleware),
  };
};

export default useStore;
