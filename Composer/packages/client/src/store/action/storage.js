import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';

export async function setStorageExplorerStatus(dispatch, status) {
  dispatch({
    type: ActionTypes.STORAGEEXPLORER_STATUS_SET,
    payload: { status },
  });
}

export async function fetchStorages(dispatch) {
  try {
    const response = await axios.get(`${BASEURL}/storages`);
    dispatch({
      type: ActionTypes.STORAGE_GET_SUCCESS,
      payload: { response },
    });
    return response.data;
  } catch (err) {
    dispatch({
      type: ActionTypes.STORAGE_GET_FAILURE,
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
      type: ActionTypes.STORAGE_GET_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.STORAGE_GET_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function fetchFolderItemsByPath(dispatch, id, path) {
  try {
    const response = await axios.get(`${BASEURL}/storages/${id}/blobs/${path}`);
    dispatch({
      type: ActionTypes.STORAGEFILE_GET_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.STORAGEFILE_GET_FAILURE,
      payload: null,
      error: err,
    });
  }
}
