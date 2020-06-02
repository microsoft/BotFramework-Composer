// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import keys from 'lodash/keys';

import { ReducerFunc } from './../types';

type ReducerMap = { [key: string]: [(state: any, action: any) => void, { [key: string]: any }] };

export function combineReducer(reducers: ReducerMap): [ReducerFunc, any] {
  const finalReducers = {};
  const globalState = {};

  const reducerKeys = keys(reducers);

  reducerKeys.forEach((key) => {
    finalReducers[key] = reducers[key][0];
    globalState[key] = reducers[key][1];
  });

  return [
    (state: any, action: any) => {
      return reducerKeys.reduce((state, key) => {
        const currentReducer = finalReducers[key];
        const prevState = state[key];
        state[key] = currentReducer(prevState, action);
        return state;
      }, state);
    },
    globalState,
  ];
}
