// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants/index';
import httpClient from './../../utils/httpUtil';

export const getRuntimeTemplates: ActionCreator = async ({ dispatch }) => {
  try {
    const response = await httpClient.get(`/runtime/templates`);
    dispatch({
      type: ActionTypes.SET_RUNTIME_TEMPLATES,
      payload: response.data,
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: err,
    });
  }
};

export const ejectRuntime: ActionCreator = async ({ dispatch }, projectId, name) => {
  try {
    const response = await httpClient.post(`/runtime/eject/${projectId}/${name}`);
    dispatch({
      type: ActionTypes.EJECT_SUCCESS,
      payload: response.data,
    });
    return true;
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: err,
    });
    return false;
  }
};
