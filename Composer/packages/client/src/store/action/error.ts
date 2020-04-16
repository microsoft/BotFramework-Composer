// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants';

export const setError: ActionCreator = ({ dispatch }, error) => {
  dispatch({
    type: ActionTypes.SET_ERROR,
    payload: error,
  });
};

export const setMessage: ActionCreator = ({ dispatch }, message) => {
  dispatch({
    type: ActionTypes.SET_MESSAGE,
    payload: message,
  });
};
