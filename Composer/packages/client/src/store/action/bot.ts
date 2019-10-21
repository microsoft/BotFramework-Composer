import axios from 'axios';

import { ActionCreator } from '../types';

import { BASEURL, ActionTypes } from './../../constants';

export const connectBot: ActionCreator = async (store, settings) => {
  const state = store.getState();
  const { botEnvironment } = state;
  const path = `${BASEURL}/launcher/connect?botEnvironment=${botEnvironment}`;

  try {
    const res = await axios.get(path);
    store.dispatch({
      type: ActionTypes.CONNECT_BOT_SUCCESS,
      payload: {
        status: 'connected',
        botEndpoint: res.data.botEndpoint,
      },
    });
    await reloadBot(store, settings);
  } catch (err) {
    throw new Error(err.response.data.message);
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
  const path = `${BASEURL}/launcher/connect?botEnvironment=${botEnvironment}`;

  try {
    const res = await axios.get(path);
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
  const { botEnvironment } = getState();
  const path = `${BASEURL}/launcher/sync`;
  try {
    const targetEnvironment = botEnvironment === 'integration' ? 'production' : 'integration';

    await axios.post(path, { ...settings, targetEnvironment });
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

export const getPublishHistory: ActionCreator = async ({ dispatch }) => {
  const path = `${BASEURL}/launcher/publishHistory`;
  try {
    const res = await axios.get(path);
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

export const publish: ActionCreator = async ({ dispatch }) => {
  const path = `${BASEURL}/launcher/publish`;

  dispatch({
    type: ActionTypes.PUBLISH_BEGIN,
    payload: {
      start: true,
    },
  });

  try {
    const res = await axios.post(path);

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

export const publishVersion: ActionCreator = async ({ dispatch }, version) => {
  const path = `${BASEURL}/launcher/publish/${version}`;

  dispatch({
    type: ActionTypes.PUBLISH_BEGIN,
    payload: {
      start: true,
    },
  });

  try {
    const res = await axios.post(path);
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
