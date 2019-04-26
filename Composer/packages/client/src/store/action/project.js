import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';
import { navTo, clearNavHistory } from './navigation';

export async function fetchProject(dispatch) {
  try {
    const response = await axios.get(`${BASEURL}/projects/opened`);
    const dialogs = response.data.dialogs;
    dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: { response },
    });
    if (dialogs && dialogs.length > 0) {
      navTo(dispatch, `[${dialogs[0].name}]`);
    }
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
    const response = await axios.put(`${BASEURL}/projects/opened`, data);
    const dialogs = response.data.dialogs;
    dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: { response },
    });
    if (dialogs && dialogs.length > 0) {
      navTo(dispatch, `[${dialogs[0].name}]`);
    }
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_PROJECT_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function saveProjectAs(dispatch, storageId, absolutePath) {
  try {
    const data = {
      storageId: storageId,
      path: absolutePath,
    };
    const response = await axios.post(`${BASEURL}/projects/opened/project/saveAs`, data);
    const dialogs = response.data.dialogs;
    dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: { response },
    });
    if (dialogs && dialogs.length > 0) {
      navTo(dispatch, `[${dialogs[0].name}]`);
    }
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
    const response = await axios.put(`${BASEURL}/projects/opened/dialogs/${name}`, { name, content });
    dispatch({
      type: ActionTypes.UPDATE_DIALOG,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.UPDATE_DIALOG_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function updateProjFile(dispatch, { name, content }) {
  try {
    const response = await axios.put(`${BASEURL}/projects/opened/botFile`, { name, content });
    dispatch({
      type: ActionTypes.PROJ_FILE_UPDATE_SUCCESS,
      payload: { response },
    });
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
    const response = await axios.post(`${BASEURL}/projects/opened/dialogs`, { name, steps });
    dispatch({
      type: ActionTypes.CREATE_DIALOG_SUCCESS,
      payload: { response },
    });
    // the new dialog only has 1 rule, so navigate directly there
    clearNavHistory(dispatch);
    navTo(dispatch, `[${name}].rules[0]`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

export async function updateLgTemplate(dispatch, { name, content }) {
  try {
    const response = await axios.put(`${BASEURL}/projects/opened/lgTemplates/${name}`, { name, content });
    dispatch({
      type: ActionTypes.UPDATE_LG_TEMPLATE,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.UPDATE_LG_FAILURE,
      payload: null,
      error: err,
    });
  }
}
