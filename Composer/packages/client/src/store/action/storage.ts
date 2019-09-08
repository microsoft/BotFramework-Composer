import axios from 'axios';

import { ActionCreator } from '../types';

import { BASEURL, ActionTypes } from './../../constants';

export const fetchStorages: ActionCreator = async ({ dispatch }) => {
  try {
    const response = await axios.get(`${BASEURL}/storages`);
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
    const response = await axios.get(`${BASEURL}/assets/projectTemplates`);

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
    const response = await axios.post(`${BASEURL}/storages`, storageData);
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
    const response = await axios.get(`${BASEURL}/storage/${fileName}`);
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
    const response = await axios.get(`${BASEURL}/storages/${id}/blobs/${path}`);
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
