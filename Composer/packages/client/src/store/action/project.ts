/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import axios from 'axios';
import { navigate } from '@reach/router';

import { ActionCreator } from '../types';

import { BASEURL, ActionTypes, BASEPATH } from './../../constants/index';
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
    navigate(BASEPATH);
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
