import axios from 'axios';

import { ActionCreator } from '../types';

import { BASEURL, ActionTypes } from './../../constants/index';
import { navigateTo } from './../../utils/navigation';
import { startBot } from './bot';
import { navTo } from './navigation';
import settingStorage from './../../utils/dialogSettingStorage';

export const setCreationFlowStatus: ActionCreator = ({ dispatch }, creationFlowStatus) => {
  dispatch({
    type: ActionTypes.SET_CREATION_FLOW_STATUS,
    payload: {
      creationFlowStatus,
    },
  });
};

export const saveTemplateId: ActionCreator = ({ dispatch }, templateId) => {
  dispatch({
    type: ActionTypes.SAVE_TEMPLATE_ID,
    payload: {
      templateId,
    },
  });
};

export const fetchProject: ActionCreator = async store => {
  try {
    const response = await axios.get(`${BASEURL}/projects/opened`);
    store.dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    return response.data;
  } catch (err) {
    navigateTo('/home');
    store.dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
};

export const fetchRecentProjects: ActionCreator = async ({ dispatch }) => {
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
};

export const openBotProject: ActionCreator = async (store, absolutePath) => {
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
      navTo(store, 'Main');
      startBot(store, true);
    }
    return response.data;
  } catch (err) {
    store.dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        summary: 'Failed to open bot',
        message: err.response.data.message,
      },
    });
  }
};

export const saveProjectAs: ActionCreator = async (store, name, description) => {
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
      navTo(store, 'Main');
    }
    return response.data;
  } catch (err) {
    store.dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
};

export const createProject: ActionCreator = async (store, templateId, name, description, location) => {
  //set storageId = 'default' now. Some other storages will be added later.
  const storageId = 'default';
  try {
    const data = {
      storageId,
      templateId,
      name,
      description,
      location,
    };
    const response = await axios.post(`${BASEURL}/projects`, data);
    const dialogs = response.data.dialogs;
    settingStorage.remove(name);
    store.dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    if (dialogs && dialogs.length > 0) {
      navTo(store, 'Main');
    }
    return response.data;
  } catch (err) {
    store.dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
};

export const getAllProjects = async () => {
  try {
    return (await axios.get(`${BASEURL}/projects`)).data.children;
  } catch (err) {
    return err;
  }
};
