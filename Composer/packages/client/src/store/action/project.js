import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';
import { navTo, clearNavHistory } from './navigation';

export function setCreationFlowStatus(dispatch, creationFlowStatus) {
  dispatch({
    type: ActionTypes.SET_CREATION_FLOW_STATUS,
    payload: {
      creationFlowStatus,
    },
  });
}

export function saveTemplateId(dispatch, templateId) {
  dispatch({
    type: ActionTypes.SAVE_TEMPLATE_ID,
    payload: {
      templateId,
    },
  });
}

export async function fetchProject(dispatch) {
  try {
    const response = await axios.get(`${BASEURL}/projects/opened`);
    const dialogs = response.data.dialogs;
    dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    clearNavHistory(dispatch);
    if (dialogs && dialogs.length > 0) {
      navTo(dispatch, `${dialogs[0].name}#`);
    }
  } catch (err) {
    dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
}

export async function openBotProject(dispatch, absolutePath) {
  //set storageId = 'default' now. Some other storages will be added later.
  const storageId = 'default';
  try {
    const data = {
      storageId,
      path: absolutePath,
    };
    const response = await axios.put(`${BASEURL}/projects/opened`, data);
    const dialogs = response.data.dialogs;
    dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    clearNavHistory(dispatch);
    if (dialogs && dialogs.length > 0) {
      navTo(dispatch, `${dialogs[0].name}#`);
    }
  } catch (err) {
    dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
}

export async function saveProjectAs(dispatch, name, description) {
  //set storageId = 'default' now. Some other storages will be added later.
  const storageId = 'default';
  try {
    const data = {
      storageId,
      name,
      description,
    };
    const response = await axios.post(`${BASEURL}/projects/opened/project/saveAs`, data);
    const dialogs = response.data.dialogs;
    dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    clearNavHistory(dispatch);
    if (dialogs && dialogs.length > 0) {
      navTo(dispatch, `${dialogs[0].name}#`);
    }
  } catch (err) {
    dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
}

export async function createProject(dispatch, templateId, name, description) {
  //set storageId = 'default' now. Some other storages will be added later.
  const storageId = 'default';
  try {
    const data = {
      storageId,
      templateId,
      name,
      description,
    };
    const response = await axios.post(`${BASEURL}/projects`, data);
    const dialogs = response.data.dialogs;
    dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    clearNavHistory(dispatch);
    if (dialogs && dialogs.length > 0) {
      navTo(dispatch, `${dialogs[0].name}#`);
    }
  } catch (err) {
    dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
}

export async function updateProjFile(dispatch, { name, content }) {
  try {
    const response = await axios.put(`${BASEURL}/projects/opened/botFile`, { name, content });
    dispatch({
      type: ActionTypes.UPDATE_PROJFILE__SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({ type: ActionTypes.UPDATE_PROJFILE__FAILURE, payload: null, error: err });
  }
}

export async function getAllProjects() {
  try {
    return (await axios.get(`${BASEURL}/projects`)).data.children;
  } catch (err) {
    return err;
  }
}
