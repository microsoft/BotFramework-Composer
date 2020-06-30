// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { ActionCreator } from '../types';
import { ActionTypes } from '../../constants';

import httpClient from './../../utils/httpUtil';

export const fetchStorages: ActionCreator = async ({ dispatch }) => {
  try {
    const response = await httpClient.get(`/storages`);
    dispatch({
      type: ActionTypes.GET_STORAGE_SUCCESS,
      payload: {
        response,
      },
    });
    return response.data;
  } catch (err) {
    dispatch({ type: ActionTypes.GET_STORAGE_FAILURE, payload: null, error: err });
  }
};

export async function fetchTemplates({ dispatch }) {
  try {
    const response = await httpClient.get(`/assets/projectTemplates`);

    dispatch({
      type: ActionTypes.GET_TEMPLATE_PROJECTS_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_TEMPLATE_PROJECTS_FAILURE,
      error: err,
    });
  }
}

export const addNewStorage: ActionCreator = async ({ dispatch }, storageData) => {
  try {
    const response = await httpClient.post(`/storages`, storageData);
    dispatch({
      type: ActionTypes.GET_STORAGE_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({ type: ActionTypes.GET_STORAGE_FAILURE, payload: null, error: err });
  }
};

// todo: enable this if we have more storage, currently we only have one.
export const fetchStorageByName: ActionCreator = async ({ dispatch }, fileName) => {
  try {
    const response = await httpClient.get(`/storage/${fileName}`);
    dispatch({
      type: ActionTypes.GET_STORAGE_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({ type: ActionTypes.GET_STORAGE_FAILURE, payload: null, error: err });
  }
};

export const fetchFolderItemsByPath: ActionCreator = async ({ dispatch }, id, path) => {
  try {
    dispatch({
      type: ActionTypes.SET_STORAGEFILE_FETCHING_STATUS,
      payload: {
        status: 'pending',
      },
    });
    const response = await httpClient.get(`/storages/${id}/blobs`, { params: { path } });
    dispatch({
      type: ActionTypes.GET_STORAGEFILE_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_STORAGEFILE_FETCHING_STATUS,
      payload: {
        status: 'failure',
      },
      error: err,
    });
  }
};

export const updateCurrentPath: ActionCreator = async ({ dispatch }, path, storageId) => {
  try {
    const response = await httpClient.put(`/storages/currentPath`, { path, storageId });
    dispatch({
      type: ActionTypes.GET_STORAGE_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({ type: ActionTypes.GET_STORAGE_FAILURE, payload: null, error: err });
  }
};

export const createFolder: ActionCreator = async ({ dispatch }, path, name) => {
  const storageId = 'default';
  try {
    await httpClient.post(`/storages/folder`, { path, name, storageId });
  } catch (e) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        message: e.message,
        summary: formatMessage('Create Folder Error'),
      },
    });
  }
};

export const updateFolder: ActionCreator = async ({ dispatch }, path, oldName, newName) => {
  const storageId = 'default';
  try {
    await httpClient.put(`/storages/folder`, { path, oldName, newName, storageId });
  } catch (e) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        message: e.message,
        summary: formatMessage('Update Folder Name Error'),
      },
    });
  }
};
