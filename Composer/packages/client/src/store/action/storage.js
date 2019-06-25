import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';

export async function fetchStorages(dispatch) {
  try {
    const response = await axios.get(`${BASEURL}/storages`);
    dispatch({
      type: ActionTypes.GET_STORAGE_SUCCESS,
      payload: { response },
    });
    return response.data;
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_STORAGE_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function fetchTemplates() {
  try {
    const response = await axios.get(`${BASEURL}/assets/projectTemplates`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
}

export async function addNewStorage(dispatch, storageData) {
  try {
    const response = await axios.post(`${BASEURL}/storages`, storageData);
    dispatch({
      type: ActionTypes.GET_STORAGE_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_STORAGE_FAILURE,
      payload: null,
      error: err,
    });
  }
}

// todo: enable this if we have more storage, currently we only have one.
export async function fetchStorageByName(dispatch, fileName) {
  try {
    const response = await axios.get(`${BASEURL}/storage/${fileName}`);
    dispatch({
      type: ActionTypes.GET_STORAGE_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_STORAGE_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function fetchFolderItemsByPath(dispatch, id, path) {
  try {
    dispatch({
      type: ActionTypes.SET_STORAGEFILE_FETCHING_STATUS,
      payload: { status: 'pending' },
    });
    const response = await axios.get(`${BASEURL}/storages/${id}/blobs/${path}`);
    dispatch({
      type: ActionTypes.GET_STORAGEFILE_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_STORAGEFILE_FETCHING_STATUS,
      payload: { status: 'failure' },
      error: err,
    });
  }
}

export async function getAllBotsFromFixedLocation() {
  try {
    return (await axios.get(`${BASEURL}/storages/fixed`)).data.children;
  } catch (err) {
    console.log(err);
  }
}
