// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import merge from 'lodash/merge';

import { ActionCreator, DialogSetting } from '../types';
import { ActionTypes } from '../../constants';
import httpClient from '../../utils/httpUtil';

export const setSettings: ActionCreator = async ({ dispatch }, projectId: string, settings: DialogSetting) => {
  dispatch({
    type: ActionTypes.SYNC_ENV_SETTING,
    payload: {
      projectId,
      settings,
    },
  });
};

export const setPublishTargets: ActionCreator = async ({ dispatch }, publishTarget) => {
  dispatch({
    type: ActionTypes.SET_PUBLISH_TARGETS,
    payload: {
      publishTarget,
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

export const setQnASettings: ActionCreator = async (store, projectId, subscriptionKey) => {
  try {
    const response = await httpClient.post(`/projects/${projectId}/qnaSettings/set`, {
      projectId,
      subscriptionKey,
    });
    const settings = merge({}, store.getState().settings, { qna: { endpointKey: response.data } });
    store.dispatch({
      type: ActionTypes.SYNC_ENV_SETTING,
      payload: {
        projectId,
        settings,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
