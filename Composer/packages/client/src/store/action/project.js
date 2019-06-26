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
    clearNavHistory(dispatch);
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
    clearNavHistory(dispatch);
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
    clearNavHistory(dispatch);
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
    clearNavHistory(dispatch);
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
