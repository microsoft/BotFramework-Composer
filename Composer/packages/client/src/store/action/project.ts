// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { navigate } from '@reach/router';

import { ActionCreator } from '../types';

import { ActionTypes, BASEPATH, BotStatus } from './../../constants/index';
import { navigateTo } from './../../utils/navigation';
import { startBot } from './publisher';
import { navTo } from './navigation';
import settingStorage from './../../utils/dialogSettingStorage';
import httpClient from './../../utils/httpUtil';

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

export const setBotStatus: ActionCreator = ({ dispatch }, status: BotStatus) => {
  dispatch({
    type: ActionTypes.UPDATE_BOTSTATUS,
    payload: status,
  });
};

export const fetchProjectById: ActionCreator = async (store, projectId) => {
  try {
    const response = await httpClient.get(`/projects/${projectId}`);
    store.dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    return response.data;
  } catch (err) {
    navigateTo('/home');
    store.dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: { error: err } });
  }
};

export const fetchProject: ActionCreator = async store => {
  const state = store.getState();
  const projectId = state.projectId;
  return fetchProjectById(store, projectId);
};

export const fetchRecentProjects: ActionCreator = async ({ dispatch }) => {
  try {
    const response = await httpClient.get(`/projects/recent`);
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
    const response = await httpClient.put(`/projects/open`, data);
    const files = response.data.files;
    const projectId = response.data.id;
    store.dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    if (files && files.length > 0) {
      // navTo(store, 'Main');
      const mainUrl = `/bot/${projectId}/dialogs/Main`;
      navigateTo(mainUrl);
      startBot(store, true);
    } else {
      navigate(BASEPATH);
    }
  } catch (err) {
    store.dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        summary: 'Failed to open bot',
        message: err.response.data.message,
      },
    });
    store.dispatch({
      type: ActionTypes.REMOVE_RECENT_PROJECT,
      payload: {
        path: absolutePath,
      },
    });
  }
};

export const saveProjectAs: ActionCreator = async (store, projectId, name, description, location) => {
  //set storageId = 'default' now. Some other storages will be added later.
  const storageId = 'default';
  try {
    const data = {
      storageId,
      name,
      description,
      location,
    };
    const response = await httpClient.post(`/projects/${projectId}/project/saveAs`, data);
    const files = response.data.files;
    store.dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    if (files && files.length > 0) {
      navTo(store, 'Main');
    }
    return response.data;
  } catch (err) {
    store.dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
};

export const createProject: ActionCreator = async (
  store,
  templateId: string,
  name: string,
  description: string,
  location: string
) => {
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
    const response = await httpClient.post(`/projects`, data);
    const files = response.data.files;
    settingStorage.remove(name);
    store.dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: {
        response,
      },
    });
    if (files && files.length > 0) {
      navTo(store, 'Main');
    }
    return response.data;
  } catch (err) {
    store.dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: null, error: err });
  }
};

export const getAllProjects = async () => {
  try {
    return (await httpClient.get(`/projects`)).data.children;
  } catch (err) {
    return err;
  }
};
