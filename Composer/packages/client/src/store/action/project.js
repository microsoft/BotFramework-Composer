import axios from 'axios';

import { BASEURL, ActionTypes } from '../../constants/index';

import { navTo, clearNavHistory } from './navigation';

export async function fetchProject(dispatch) {
  try {
    const response = await axios.get(`${BASEURL}/projects/opened`);
    dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_PROJECT_FAILURE,
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
    const response = await axios.get(`${BASEURL}/projects/opened`);
    dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_PROJECT_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function updateDialog(dispatch, { name, content }) {
  try {
    dispatch({
      type: ActionTypes.UPDATE_DIALOG,
      payload: { name, content },
    });
    await axios.put(`${BASEURL}/projects/opened/dialogs/${name}`, { content });
  } catch (err) {
    dispatch({
      type: ActionTypes.UPDATE_DIALOG_FAILURE,
      payload: null,
      error: err,
    });
  }
}

// export async function saveFile(dispatch, { name, content }) {
//   try {
//     await axios.put(`${BASEURL}/projects/opened/files`, { name, content });
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.error(err);
//   }
// }

export async function updateProjFile(dispatch, { name, content }) {
  try {
    dispatch({
      type: ActionTypes.PROJ_FILE_UPDATE_SUCCESS,
      payload: { name, content },
    });
    await axios.put(`${BASEURL}/projects/opened/projectFile`, { name, content });
  } catch (err) {
    dispatch({
      type: ActionTypes.PROJ_FILE_UPDATE_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function createDialog(dispatch, { name, steps }) {
  try {
    await axios.post(`${BASEURL}/projects/opened/dialogs`, { name, steps });
    const response = await axios.get(`${BASEURL}/projects/opened?refresh=true`);
    dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: { response },
    });
    // the new dialog only has 1 rule, so navigate directly there
    clearNavHistory(dispatch);
    navTo(dispatch, `${name}.rules[0]`);
    // navDown(dispatch, '.rules[0]');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}
