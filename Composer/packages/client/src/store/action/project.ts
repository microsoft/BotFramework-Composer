// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { navigate } from '@reach/router';

import { ActionCreator } from '../types';
import filePersistence from '../persistence/FilePersistence';
import lgWorker from '../parsers/lgWorker';
import luWorker from '../parsers/luWorker';
import { ActionTypes, BASEPATH, BotStatus } from '../../constants';

import { navigateTo } from './../../utils/navigation';
import { navTo } from './navigation';
import settingStorage from './../../utils/dialogSettingStorage';
import luFileStatusStorage from './../../utils/luFileStatusStorage';
import httpClient from './../../utils/httpUtil';

const checkProjectUpdates = async () => {
  const workers = [filePersistence, lgWorker, luWorker];

  return Promise.all(workers.map((w) => w.flush()));
};

export const setOpenPendingStatus: ActionCreator = async (store) => {
  store.dispatch({
    type: ActionTypes.GET_PROJECT_PENDING,
  });
  await checkProjectUpdates();
};

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
    payload: { status },
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
  } catch (error) {
    navigateTo('/home');
    store.dispatch({ type: ActionTypes.GET_PROJECT_FAILURE, payload: { error } });
  }
};

export const fetchProject: ActionCreator = async (store) => {
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
  } catch (error) {
    dispatch({
      type: ActionTypes.GET_RECENT_PROJECTS_FAILURE,
      payload: {
        error,
      },
    });
  }
};

export const deleteBotProject: ActionCreator = async (store, projectId) => {
  try {
    await httpClient.delete(`/projects/${projectId}`);
    luFileStatusStorage.removeAllStatuses(projectId);
    settingStorage.remove(projectId);
    store.dispatch({
      type: ActionTypes.REMOVE_PROJECT_SUCCESS,
    });
  } catch (e) {
    store.dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        message: e.message,
        summary: 'Delete Bot Error',
      },
    });
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
    await setOpenPendingStatus(store);
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
    } else {
      navigate(BASEPATH);
    }
  } catch (error) {
    store.dispatch({
      type: ActionTypes.GET_PROJECT_FAILURE,
      payload: {
        error,
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
    await setOpenPendingStatus(store);
    const response = await httpClient.post(`/projects/${projectId}/project/saveAs`, data);
    const files = response.data.files;
    const newProjectId = response.data.id;
    store.dispatch({
      type: ActionTypes.GET_PROJECT_SUCCESS,
      payload: { response },
    });
    if (files && files.length > 0) {
      const mainUrl = `/bot/${newProjectId}/dialogs/Main`;
      navigateTo(mainUrl);
    }
  } catch (error) {
    store.dispatch({
      type: ActionTypes.GET_PROJECT_FAILURE,
      payload: {
        error,
      },
    });
  }
};

export const createProject: ActionCreator = async (
  store,
  templateId: string,
  name: string,
  description: string,
  location: string,
  schemaUrl?: string
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
      schemaUrl,
    };
    await setOpenPendingStatus(store);
    const response = await httpClient.post(`/projects`, data);
    const files = response.data.files;
    const projectId = response.data.id;
    settingStorage.remove(projectId);
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
  } catch (error) {
    store.dispatch({
      type: ActionTypes.GET_PROJECT_FAILURE,
      payload: {
        error,
      },
    });
  }
};

export const getAllProjects = async () => {
  try {
    return (await httpClient.get(`/projects`)).data.children;
  } catch (err) {
    return err;
  }
};
