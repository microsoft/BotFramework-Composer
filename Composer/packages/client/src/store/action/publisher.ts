// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { ActionCreator } from '../types';
import filePersistence from '../persistence/FilePersistence';
import { ActionTypes, DefaultPublishConfig } from '../../constants';

import httpClient from './../../utils/httpUtil';

// this is the interval at which the runtime manager will be polled
const POLLING_INTERVAL = 2500;

export const stopPollingRuntime: ActionCreator = ({ getState, dispatch }) => {
  const botStatusInterval = getState().botStatusInterval;
  if (botStatusInterval) {
    clearInterval(botStatusInterval);
  }
  dispatch({
    type: ActionTypes.RUNTIME_POLLING_UPDATE,
    payload: null,
  });
};

export const startPollingRuntime: ActionCreator = (store) => {
  const botStatusInterval = store.getState().botStatusInterval;
  const projectId = store.getState().projectId;
  if (!botStatusInterval) {
    const cancelInterval = setInterval(() => {
      getPublishStatus(store, projectId, DefaultPublishConfig);
    }, POLLING_INTERVAL);
    store.dispatch({
      type: ActionTypes.RUNTIME_POLLING_UPDATE,
      payload: cancelInterval,
    });
  }
};

export const getPublishTargetTypes: ActionCreator = async ({ dispatch }) => {
  try {
    const response = await httpClient.get(`/publish/types`);
    dispatch({
      type: ActionTypes.GET_PUBLISH_TYPES_SUCCESS,
      payload: {
        typelist: response.data,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: err,
    });
  }
};

export const publishToTarget: ActionCreator = async ({ dispatch }, projectId, target, metadata, sensitiveSettings) => {
  try {
    const response = await httpClient.post(`/publish/${projectId}/publish/${target.name}`, {
      metadata,
      sensitiveSettings,
    });
    dispatch({
      type: ActionTypes.PUBLISH_SUCCESS,
      payload: {
        ...response.data,
        target: target,
      },
    });
  } catch (err) {
    // special case to handle dotnet issues
    if (
      /(Command failed: dotnet user-secrets)|(install[\w\r\s\S\t\n]*\.NET Core SDK)/.test(
        err.response?.data?.message as string
      )
    ) {
      dispatch({
        type: ActionTypes.PUBLISH_FAILED_DOTNET,
        payload: {
          error: {
            message: formatMessage('To run this bot, Composer needs .NET Core SDK.'),
            linkAfterMessage: {
              text: formatMessage('Learn more.'),
              url: 'https://docs.microsoft.com/en-us/composer/setup-yarn',
            },
            link: {
              text: formatMessage('Install Microsoft .NET Core SDK'),
              url: 'https://dotnet.microsoft.com/download/dotnet-core/3.1',
            },
          },
          target: target,
        },
      });
    } else
      dispatch({
        type: ActionTypes.PUBLISH_FAILED,
        payload: {
          error: err.response.data,
          target: target,
        },
      });
  }
};

export const rollbackToVersion: ActionCreator = async ({ dispatch }, projectId, target, version, sensitiveSettings) => {
  try {
    const response = await httpClient.post(`/publish/${projectId}/rollback/${target.name}`, {
      version,
      sensitiveSettings,
    });
    dispatch({
      type: ActionTypes.PUBLISH_SUCCESS,
      payload: {
        ...response.data,
        target: target,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.PUBLISH_FAILED,
      payload: {
        error: err.response.data,
        target: target,
      },
    });
  }
};

// get bot status from target publisher
export const getPublishStatus: ActionCreator = async ({ dispatch }, projectId, target) => {
  try {
    const response = await httpClient.get(`/publish/${projectId}/status/${target.name}`);
    dispatch({
      type: ActionTypes.GET_PUBLISH_STATUS,
      payload: {
        ...response.data,
        target: target,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_PUBLISH_STATUS_FAILED,
      payload: {
        ...err.response.data,
        target: target,
      },
    });
  }
};

export const getPublishHistory: ActionCreator = async ({ dispatch }, projectId, target) => {
  try {
    await filePersistence.flush();
    const response = await httpClient.get(`/publish/${projectId}/history/${target.name}`);
    dispatch({
      type: ActionTypes.GET_PUBLISH_HISTORY,
      payload: {
        history: response.data,
        target: target,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: err,
    });
  }
};
