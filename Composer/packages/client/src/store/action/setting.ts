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

export const setPublishTarget: ActionCreator = async ({ dispatch }, _, publishTarget) => {
  dispatch({
    type: ActionTypes.SET_PUBLISH_TARGETS,
    payload: {
      publishTarget,
    },
  });
};

export const setRuntimeSettings: ActionCreator = async ({ dispatch }, _, path, commands) => {
  dispatch({
    type: ActionTypes.SET_RUNTIME_SETTINGS,
    payload: {
      path,
      commands,
    },
  });
};

export const setCustomRuntime: ActionCreator = async ({ dispatch }, _, isOn) => {
  dispatch({
    type: ActionTypes.SET_CUSTOM_RUNTIME_TOGGLE,
    payload: {
      isOn,
    },
  });
};

export const setRuntimeField: ActionCreator = async ({ dispatch }, _, field, newValue) => {
  dispatch({
    type: ActionTypes.SET_RUNTIME_FIELD,
    payload: {
      field,
      newValue,
    },
  });
};
