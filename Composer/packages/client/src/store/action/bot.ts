// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants';
import httpClient from './../../utils/httpUtil';

export const connectBot: ActionCreator = async (store, settings) => {
  const state = store.getState();
  const { botEnvironment, projectId } = state;
  const path = `/launcher/${projectId}/connect?botEnvironment=${botEnvironment}`;

  try {
    const res = await httpClient.get(path);
    await reloadBot(store, settings);
    store.dispatch({
      type: ActionTypes.CONNECT_BOT_SUCCESS,
      payload: {
        status: 'connected',
        botEndpoint: res.data.botEndpoint,
      },
    });
  } catch (err) {
    store.dispatch({
      type: ActionTypes.CONNECT_BOT_FAILURE,
      payload: {
        status: 'unConnected',
      },
    });
    throw new Error(err.response?.data?.message || err.message);
  }
};

// return only the connect URL -- do not reload
export const getConnect: ActionCreator = async (store, env) => {
  const state = store.getState();
  let { botEnvironment } = state;
  // allow the environment to be overwritten for multi-environment setups
  if (env) {
    botEnvironment = env;
  }
  const path = `/launcher/${state.projectId}/connect?botEnvironment=${botEnvironment}`;

  try {
    const res = await httpClient.get(path);
    store.dispatch({
      type: ActionTypes.GET_ENDPOINT_SUCCESS,
      payload: {
        slot: env,
        botEndpoint: res.data.botEndpoint,
      },
    });
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};

export const reloadBot: ActionCreator = async ({ dispatch, getState }, settings) => {
  const { botEnvironment, projectId } = getState();
  const path = `/launcher/${projectId}/sync`;
  try {
    const targetEnvironment = botEnvironment === 'integration' ? 'production' : 'integration';

    await httpClient.post(path, { ...settings, targetEnvironment });
    dispatch({
      type: ActionTypes.RELOAD_BOT_SUCCESS,
      payload: {
        error: '',
      },
    });
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};

export const getPublishHistory: ActionCreator = async ({ dispatch, getState }) => {
  const { projectId } = getState();
  const path = `/launcher/${projectId}/publishHistory`;
  try {
    const res = await httpClient.get(path);
    dispatch({
      type: ActionTypes.GET_PUBLISH_VERSIONS_SUCCESS,
      payload: {
        versions: res.data,
      },
    });
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};

export const publish: ActionCreator = async ({ dispatch, getState }) => {
  const { projectId } = getState();

  const path = `/launcher/${projectId}/publish`;

  dispatch({
    type: ActionTypes.PUBLISH_BEGIN,
    payload: {
      start: true,
    },
  });

  try {
    const res = await httpClient.post(path);

    // test for error
    dispatch({
      type: ActionTypes.PUBLISH_SUCCESS,
      payload: {
        versions: res.data,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.PUBLISH_ERROR,
      payload: {
        error: err.response.data.message,
      },
    });
  }
};

export const publishVersion: ActionCreator = async ({ dispatch, getState }, version) => {
  const { projectId } = getState();

  const path = `/launcher/${projectId}/publish/${version}`;

  dispatch({
    type: ActionTypes.PUBLISH_BEGIN,
    payload: {
      start: true,
    },
  });

  try {
    const res = await httpClient.post(path);
    dispatch({
      type: ActionTypes.PUBLISH_SUCCESS,
      payload: {
        versions: res.data,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.PUBLISH_ERROR,
      payload: {
        error: err.response.data.message,
      },
    });
  }
};

export const startBot: ActionCreator = ({ dispatch }, toStartBot) => {
  dispatch({
    type: ActionTypes.TO_START_BOT,
    payload: {
      toStartBot,
    },
  });
};
