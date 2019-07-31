import axios from 'axios';
import { navigate } from '@reach/router';

import { BASEURL, ActionTypes, BASEPATH } from './../../constants/index';
import { resolveToBasePath } from './../../utils/fileUtil';
import { startBot } from './bot';

export function updateOAuth({ dispatch }, oAuth) {
  dispatch({
    type: ActionTypes.UPDATE_OAUTH,
    payload: {
      oAuth,
    },
  });
}

export function setCreationFlowStatus({ dispatch }, creationFlowStatus) {
  dispatch({
    type: ActionTypes.SET_CREATION_FLOW_STATUS,
    payload: {
      creationFlowStatus,
    },
  });
}

export function saveTemplateId({ dispatch }, templateId) {
  dispatch({
    type: ActionTypes.SAVE_TEMPLATE_ID,
    payload: {
      templateId,
    },
  });
}

export async function fetchProject(store) {
  try {
    const response = await axios.get(`${BASEURL}/projects/opened`);
    const dialogs = response.data.dialogs;
    store.dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    navigate(resolveToBasePath(BASEPATH, '/home'));
    store.dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
}

export async function fetchRecentProjects({ dispatch }) {
  try {
    const response = await axios.get(`${BASEURL}/projects/recent`);
    dispatch({
      type: ActionTypes.GET_RECENT_PROJECTS_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({ type: ActionTypes.GET_RECENT_PROJECTS_FAILURE, payload: null, error: err });
  }
}

export async function openBotProject(store, absolutePath) {
  //set storageId = 'default' now. Some other storages will be added later.
  const storageId = 'default';
  try {
    const data = {
      storageId,
      path: absolutePath,
    };
    const response = await axios.put(`${BASEURL}/projects/opened`, data);
    const dialogs = response.data.dialogs;
    store.dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    if (dialogs && dialogs.length > 0) {
      navigate('/dialogs/Main');
      startBot(dispatch, true);
    }
  } catch (err) {
    store.dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        summary: 'Failed to open bot',
        message: err.response.data.message,
      },
    });
  }
}

export async function saveProjectAs(store, name, description) {
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
    store.dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    if (dialogs && dialogs.length > 0) {
      navigate('dialogs/Main');
    }
  } catch (err) {
    store.dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
}

export async function createProject(store, templateId, name, description) {
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
    store.dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    if (dialogs && dialogs.length > 0) {
      navigate('/dialogs/Main');
    }
  } catch (err) {
    store.dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
}

export async function getAllProjects() {
  try {
    return (await axios.get(`${BASEURL}/projects`)).data.children;
  } catch (err) {
    return err;
  }
}
