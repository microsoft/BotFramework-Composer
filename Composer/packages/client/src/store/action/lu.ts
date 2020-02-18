// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants/index';
import httpClient from './../../utils/httpUtil';

export const updateLuFile: ActionCreator = async ({ dispatch }, { id, projectId, content }) => {
  try {
    const response = await httpClient.put(`/projects/${projectId}/luFiles/${id}`, { id, projectId, content });
    dispatch({
      type: ActionTypes.UPDATE_LU_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.UPDATE_LU_FAILURE,
      payload: null,
      error: err,
    });
    throw new Error(err.response.data.message);
  }
};

export const createLuFile: ActionCreator = async ({ dispatch }, { id, projectId, content }) => {
  try {
    const response = await httpClient.post(`/projects/${projectId}/luFiles`, { id, projectId, content });
    dispatch({
      type: ActionTypes.CREATE_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.CREATE_LU_FAILURE,
      payload: null,
      // TODO, createReducer do not take this error now
      // we need to put it in payload
      error: err,
    });
  }
};

export const removeLuFile: ActionCreator = async ({ dispatch }, { id, projectId }) => {
  try {
    const response = await httpClient.delete(`/projects/${projectId}/luFiles/${id}`);
    dispatch({
      type: ActionTypes.REMOVE_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.REMOVE_LU_FAILURE,
      payload: null,
      error: err,
    });
  }
};

export const publishLuis: ActionCreator = async ({ dispatch }, authoringKey, projectId) => {
  try {
    const response = await httpClient.post(`/projects/${projectId}/luFiles/publish`, { authoringKey, projectId });
    dispatch({
      type: ActionTypes.PUBLISH_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};
