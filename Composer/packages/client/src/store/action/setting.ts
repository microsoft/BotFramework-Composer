// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator, DialogSetting } from '../types';

import { ActionTypes } from './../../constants/index';

export const setSettings: ActionCreator = async ({ dispatch }, projectId: string, settings: DialogSetting) => {
  dispatch({
    type: ActionTypes.SYNC_ENV_SETTING,
    payload: {
      projectId,
      settings,
    },
  });
};

export const setPublishTarget: ActionCreator = async ({ dispatch }, publishTarget) => {
  dispatch({
    type: ActionTypes.SET_PUBLISH_TARGETS,
    payload: {
      publishTarget,
    },
  });
};

export const setRuntimeSettings: ActionCreator = async ({ dispatch }, { path, commands }) => {
  dispatch({
    type: ActionTypes.SET_RUNTIME_SETTINGS,
    payload: {
      path,
      commands,
    },
  });
};
