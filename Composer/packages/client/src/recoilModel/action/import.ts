// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';
import { ActionTypes } from '../../constants';

import httpClient from './../../utils/httpUtil';
import { setError } from './error';

export const importLibrary: ActionCreator = async (store, packageName, version, isUpdating) => {
  const state = store.getState();
  const projectId = state.projectId;
  try {
    const response = await httpClient.post(`/projects/${projectId}/import`, {
      package: packageName,
      version: version,
      isUpdating,
    });
    // fire off a project reload to update the index, etc.
    store.dispatch({
      type: ActionTypes.IMPORT_SUCCESS,
      payload: response.data,
    });
  } catch (err) {
    setError(store, {
      status: err.response.status,
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'IMPORT ERROR',
    });
  }
};

export const removeLibrary: ActionCreator = async (store, packageName) => {
  const state = store.getState();
  const projectId = state.projectId;
  try {
    const response = await httpClient.post(`/projects/${projectId}/unimport`, {
      package: packageName,
    });
    // fire off a project reload to update the index, etc.
    store.dispatch({
      type: ActionTypes.UNIMPORT_SUCCESS,
      payload: response.data,
    });
  } catch (err) {
    setError(store, {
      status: err.response.status,
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'IMPORT ERROR',
    });
  }
};

export const getLibraries: ActionCreator = async (store) => {
  try {
    const response = await httpClient.get(`/library`);

    // fire off a project reload to update the index, etc.
    store.dispatch({
      type: ActionTypes.GET_LIBRARIES_SUCCESS,
      payload: response.data,
    });
  } catch (err) {
    setError(store, {
      status: err.response.status,
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'LIBRARY ERROR',
    });
  }
};
