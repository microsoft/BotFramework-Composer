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
      navTo(dispatch, `${dialogs[0].name}#`);
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
      navTo(dispatch, `${dialogs[0].name}#`);
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
      navTo(dispatch, `${dialogs[0].name}#`);
    }
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_PROJECT_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function createProject(dispatch, storageId, absolutePath, templateId) {
  try {
    const data = {
      storageId: storageId,
      path: absolutePath,
      templateId,
    };
    const response = await axios.post(`${BASEURL}/projects`, data);
    const dialogs = response.data.dialogs;
    dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: { response },
    });
    if (dialogs && dialogs.length > 0) {
      navTo(dispatch, `${dialogs[0].name}#`);
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
      type: ActionTypes.UPDATE_PROJFILE__SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.UPDATE_PROJFILE__FAILURE,
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
    clearNavHistory(dispatch);
    navTo(dispatch, `${name}#`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

export async function updateLgFile(dispatch, { id, lgTemplates }) {
  try {
    const response = await axios.put(`${BASEURL}/projects/opened/lgFiles/${id}`, { id, lgTemplates });
    dispatch({
      type: ActionTypes.UPDATE_LG_SUCCESS,
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

export async function createLgFile(dispatch, { name, content }) {
  try {
    const response = await axios.post(`${BASEURL}/projects/opened/lgFiles`, { name, content });
    dispatch({
      type: ActionTypes.CREATE_LG_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.CREATE_LG_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function removeLgFile(dispatch, { id }) {
  try {
    const response = await axios.delete(`${BASEURL}/projects/opened/lgFiles/${id}`);
    dispatch({
      type: ActionTypes.REMOVE_LG_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.REMOVE_LG_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function updateLuFile(dispatch, { id, content }) {
  try {
    const response = await axios.put(`${BASEURL}/projects/opened/luFiles/${id}`, { id, content });
    dispatch({
      type: ActionTypes.UPDATE_LU_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.UPDATE_LU_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function createLuFile(dispatch, { name, content }) {
  try {
    const response = await axios.post(`${BASEURL}/projects/opened/luFiles`, { id: name, content });
    dispatch({
      type: ActionTypes.CREATE_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.CREATE_LU_FAILURE,
      payload: null,
      error: err,
    });
  }
}

export async function removeLuFile(dispatch, { id }) {
  try {
    const response = await axios.delete(`${BASEURL}/projects/opened/luFiles/${id}`);
    dispatch({
      type: ActionTypes.REMOVE_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.REMOVE_LU_FAILURE,
      payload: null,
      error: err,
    });
  }
}
