import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';

export async function fetchFiles(dispatch) {
  try {
    const response = await axios.get(`${BASEURL}/fileserver`);
    dispatch({
      type: ActionTypes.FILES_GET_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.FILES_GET_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function fetchFilesByOpen(dispatch, storageId, absolutePath) {
  try {
    const data = {
      storageId: storageId,
      path: absolutePath,
    };
    await axios.put(`${BASEURL}/projects/opened`, data);
    const response = await axios.get(`${BASEURL}/projects/opened/files`);
    dispatch({
      type: ActionTypes.FILES_GET_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.FILES_GET_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function updateFile(dispatch, { name, content }) {
  try {
    await axios.put(`${BASEURL}/fileserver`, payload);
    dispatch({
      type: ActionTypes.FILES_UPDATE,
      payload: {
        name,
        content,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.FILES_UPDATE_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export function setOpenFileIndex(dispatch, index) {
  dispatch({
    type: ActionTypes.OPEN_FILE_INDEX_SET,
    payload: { index },
  });
}
