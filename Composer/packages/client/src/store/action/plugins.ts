// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import once from 'lodash/once';

import { ActionTypes } from '../../constants';
import { ActionCreator, Plugin } from '../types';

import httpClient from './../../utils/httpUtil';

const injectPlugins = once(async (plugins: Plugin[]) => {
  window.React = React;
  (window as any).ComposerPlugins = [];

  const allLoaded: Promise<any>[] = [];

  plugins.forEach((plugin) => {
    if (plugin.bundles && Array.isArray(plugin.bundles)) {
      plugin.bundles.forEach((bundle) => {
        const loaded = new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = `/api/plugins/${plugin.id}/bundles/${bundle.id}`;
          script.async = true;
          const onLoad = () => resolve();
          script.onload = onLoad;

          document.body.append(script);
          // httpClient.get(`/plugins/${plugin.id}/bundles/${bundle.id}`).then((res) => {
          //   console.log(res.data);
          //   // eslint-disable-next-line security/detect-eval-with-expression
          //   const p = eval(res.data);
          //   console.log(p);
          //   (window as any).ComposerPlugins.push(p);
          //   resolve();
          // });
        });
        allLoaded.push(loaded);
      });
    }
  });
});

export const fetchPlugins: ActionCreator = async ({ dispatch }) => {
  try {
    const res = await httpClient.get('/plugins');
    await injectPlugins(res.data as Plugin[]);

    dispatch({
      type: ActionTypes.PLUGINS_FETCH_SUCCESS,
      payload: {
        plugins: res.data,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

export const addPlugin: ActionCreator<[string, string]> = async ({ dispatch }, pluginName, version) => {
  try {
    const res = await httpClient.post('/plugins', { name: pluginName, version });
    dispatch({
      type: ActionTypes.PLUGINS_ADD_SUCCESS,
      payload: {
        plugin: res.data,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

export const removePlugin: ActionCreator<[string]> = async ({ dispatch }, pluginName) => {
  try {
    const res = await httpClient.delete('/plugins', { data: { id: pluginName } });
    dispatch({
      type: ActionTypes.PLUGINS_FETCH_SUCCESS,
      payload: {
        plugins: res.data,
      },
    });
  } catch (err) {
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
