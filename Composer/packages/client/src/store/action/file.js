import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';

export async function fetchFiles(dispatch) {
  try {
    const response = await axios.get(`${BASEURL}/fileserver`);
    dispatch({
      type: ActionTypes.FILES_GET_SUCCESS,
      payload: response,
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.FILES_GET_FAILURE,
      payload: err,
    });
  }
}

export async function fetchFilesByOpen(dispatch, fileName) {
  try {
    const response = await axios.get(`${BASEURL}/fileserver/openbotFile?path=${fileName}`);
    dispatch({
      type: ActionTypes.FILES_GET_SUCCESS,
      payload: response,
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.FILES_GET_FAILURE,
      payload: err,
    });
  }
}

export async function updateFile(dispatch, payload) {
  try {
    await axios.put(`${BASEURL}/fileserver`, payload);
    dispatch({
      type: ActionTypes.FILES_UPDATE,
      payload,
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.FILES_UPDATE_FAILURE,
      payload: err,
    });
  }
}

export function setOpenFileIndex(dispatch, index) {
  dispatch({
    type: ActionTypes.OPEN_FILE_INDEX_SET,
    index,
  });
}
