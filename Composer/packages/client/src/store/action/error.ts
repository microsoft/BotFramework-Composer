// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import debounce from 'lodash/debounce';

import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants';

export const setError: ActionCreator = ({ dispatch }, error) => {
  dispatch({
    type: ActionTypes.SET_ERROR,
    payload: error,
  });
};

export const setMessage: ActionCreator = debounce(({ dispatch }, message) => {
  dispatch({
    type: ActionTypes.SET_MESSAGE,
    payload: message,
  });

  setTimeout(
    () =>
      dispatch({
        type: ActionTypes.SET_MESSAGE,
        payload: undefined,
      }),
    2000
  );
}, 500);
