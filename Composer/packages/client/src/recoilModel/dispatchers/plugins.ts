/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import httpClient from '../../utils/httpUtil';
import { pluginsState } from '../atoms';
import { PluginConfig } from '../types';

export const pluginsDispatcher = () => {
  const fetchPlugins = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const res = await httpClient.get('/plugins');

      set(pluginsState, res.data);
    } catch (err) {
      console.error(err);
    }
  });

  const addPlugin = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (pluginName: string, version: string) => {
      const { set } = callbackHelpers;
      try {
        const res = await httpClient.post('/plugins', { name: pluginName, version });
        const addedPlugin: PluginConfig = res.data;

        set(pluginsState, (plugins) => {
          if (plugins.find((p) => p.id === addedPlugin.id)) {
            plugins = plugins.map((p) => {
              if (p.id === addedPlugin.id) {
                return addedPlugin;
              }
              return p;
            });
          } else {
            plugins.push(addedPlugin);
          }
          return plugins;
        });
      } catch (err) {
        console.error(err);
      }
    }
  );

  const removePlugin = useRecoilCallback((callbackHelpers: CallbackInterface) => async (pluginName: string) => {
    const { set } = callbackHelpers;
    try {
      const res = await httpClient.delete('/plugins', { data: { id: pluginName } });

      set(pluginsState, res.data);
    } catch (err) {
      console.error(err);
    }
  });

  const togglePlugin = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (pluginId: string, enabled: boolean) => {
      const { set } = callbackHelpers;
      try {
        const res = await httpClient.patch('/plugins/toggle', {
          id: pluginId,
          enabled: Boolean(enabled),
        });
        const toggledPlugin: PluginConfig = res.data;

        set(pluginsState, (plugins) => {
          return (plugins = plugins.map((p) => {
            if (p.id === toggledPlugin.id) {
              // update the toggled plugin
              return toggledPlugin;
            }
            return p;
          }));
        });
      } catch (err) {
        // do nothing
        console.error(err);
      }
    }
  );

  return {
    fetchPlugins,
    addPlugin,
    removePlugin,
    togglePlugin,
  };
};
