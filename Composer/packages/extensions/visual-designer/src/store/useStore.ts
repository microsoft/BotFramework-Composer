// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { useReducer, Dispatch } from 'react';

import reducer from '../reducer';

import { initialStore, StoreState } from './store';

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
    state: state as StoreState,
    dispatch: applyMiddleware(dispatch, dispatchMiddleware),
  };
};

export default useStore;
