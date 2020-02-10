// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants';
import httpClient from './../../utils/httpUtil';

export const getPublishers: ActionCreator = async store => {
  const path = `/publishers`;

  try {
    const res = await httpClient.get(path);
    store.dispatch({
      type: ActionTypes.GET_PUBLISHERS,
      payload: {
        publishers: res.data,
      },
    });
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const getPublisherStatus: ActionCreator = async (store, id) => {
  const path = `/publishers/${id}/status`;

  try {
    const res = await httpClient.get(path);
    store.dispatch({
      type: ActionTypes.GET_PUBLISHER_STATUS,
      payload: {
        id: id,
        online: res.data.online,
      },
    });
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const getPublisherHistory: ActionCreator = async (store, id) => {
  const path = `/publishers/${id}/history`;

  try {
    const res = await httpClient.get(path);
    store.dispatch({
      type: ActionTypes.GET_PUBLISHER_HISTORY,
      payload: {
        id: id,
        history: res.data,
      },
    });
  } catch (err) {
    //throw new Error(err.response?.data?.message || err.message);
  }
};

export const publishBot: ActionCreator = async (store, id, version) => {
  const path = `/publishers/${id}/publish?version=${version}`;

  try {
    const res = await httpClient.post(path);
    store.dispatch({
      type: ActionTypes.PUBLISH_BOT_SUCCESS,
      payload: {
        id: id,
        data: res.data,
      },
    });
  } catch (err) {
    //throw new Error(err.response?.data?.message || err.message);
  }
};

export const rollbackBot: ActionCreator = async (store, id, version) => {
  const path = `/publishers/${id}/publish?version=${version}`;

  try {
    const res = await httpClient.post(path);
    store.dispatch({
      type: ActionTypes.ROLLBACK_BOT_SUCCESS,
      payload: {
        id: id,
        data: res.data,
      },
    });
  } catch (err) {
    //throw new Error(err.response?.data?.message || err.message);
  }
};
