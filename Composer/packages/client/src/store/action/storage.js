import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';

export async function fetchStorages(dispatch) {
  try {
    const response = await axios.get(`${BASEURL}/storages`);
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

export async function fetchFolderItemsByPath(dispatch, path, storageId) {
  try {
    const response = await axios.get(`${BASEURL}/storages/${storageId}/blobs/${path}`);
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
