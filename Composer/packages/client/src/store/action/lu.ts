// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import debounce from 'lodash/debounce';

import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants/index';
import httpClient from './../../utils/httpUtil';

export const debouncedUpdateLuFile: ActionCreator = debounce(async (store, id, projectId, content, lastModified) => {
  const state = store.getState();
  const file = state.luFiles.find(l => l.id === id);
  if (file) {
    try {
      const response = await httpClient.put(`/projects/${projectId}/luFiles/${id}`, {
        id,
        projectId,
        content,
        lastModified: file.lastModified,
      });
      // dispatch({
      //   type: ActionTypes.UPDATE_LU_SUCCESS,
      //   payload: { response },
      // });
      store.dispatch({
        type: ActionTypes.UPDATE_TIMESTAMP,
        payload: {
          id: id,
          type: 'lu',
          lastModified: response.data.lastModified,
        },
      });
    } catch (err) {
      // This requires some special handling because LU files return an error when they can't be parsed
      // or some other error in the LU system occurs...
      // TODO: DEBOUNCe THE LU UPDATE
      // ALSO, note that the update_lu_Failure *may actually write the file* and cause it to be out of sync...
      // this seems to fail sometimes when it attempts to delete generated files... which is not related to writing the file successfully...
      // and there are some rush conditions!!
      console.log('UPDATE LU ERROR', JSON.stringify(err));
      if (err.statusCode === 409) {
        store.dispatch({
          type: ActionTypes.SET_ERROR,
          payload: {
            message: err.response && err.response.data.message ? err.response.data.message : err,
            summary: 'UPDATE LU ERROR',
          },
        });
      } else {
        store.dispatch({
          type: ActionTypes.UPDATE_LU_FAILURE,
          payload: null,
          error: err,
        });
        throw new Error(err.response.data.message);
      }
    }
  }
}, 500);

export const updateLuFile: ActionCreator = async (store, { id, projectId, content }) => {
  const state = store.getState();
  const file = state.luFiles.find(l => l.id === id);
  if (file) {
    debouncedUpdateLuFile(store, id, projectId, content, file.lastModified);
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
