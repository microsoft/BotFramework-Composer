import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';
import { navTo, navDown, clearNavHistory } from './navigation';

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

export async function openBotProject(dispatch, storageId, absolutePath) {
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

export async function saveFile(dispatch, { name, content }) {
  try {
    await axios.put(`${BASEURL}/fileserver`, { name, content });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

export async function updateProjFile(dispatch, { name, content }) {
  try {
    dispatch({
      type: ActionTypes.PROJ_FILE_UPDATE_SUCCESS,
      payload: {
        name,
        content,
      },
    });
    await axios.put(`${BASEURL}/fileserver`, { name, content });
  } catch (err) {
    dispatch({
      type: ActionTypes.PROJ_FILE_UPDATE_FAILURE,
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

export async function createDialog(dispatch, { name, steps }) {
  try {
    await axios.post(`${BASEURL}/fileserver/new`, { name, steps });
    const response = await axios.get(`${BASEURL}/fileserver?refresh=true`);
    dispatch({
      type: ActionTypes.FILES_GET_SUCCESS,
      payload: { response },
    });
    // the new dialog only has 1 rule, so navigate directly there
    clearNavHistory(dispatch);
    navTo(dispatch, `${name}`);
    navDown(dispatch, '.rules[0]');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}
