// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionTypes } from '../../constants';
import { ActionCreator } from '../types';

import httpClient from './../../utils/httpUtil';

export const fetchPlugins: ActionCreator = async ({ dispatch }) => {
  try {
    const res = await httpClient.get('/plugins');
    dispatch({
      type: ActionTypes.PLUGINS_FETCH_SUCCESS,
      payload: {
        plugins: res.data,
      },
    });
  } catch (err) {
    // do nothing
    console.error(err);
  }
};

export const togglePlugin: ActionCreator<[string, boolean]> = async ({ dispatch }, pluginId, enabled) => {
  try {
    const res = await httpClient.patch('/plugins/toggle', {
      id: pluginId,
      enabled: Boolean(enabled),
    });

    dispatch({
      type: ActionTypes.PLUGINS_TOGGLE_SUCCESS,
      payload: {
        plugin: res.data,
      },
    });
  } catch (err) {
    // do nothing
    console.error(err);
  }
};
