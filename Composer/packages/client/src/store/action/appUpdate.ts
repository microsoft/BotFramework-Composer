// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ActionCreator } from '../types';
import { ActionTypes } from '../../constants';

export const setAppUpdateError: ActionCreator = ({ dispatch }, error) => {
  dispatch({
    type: ActionTypes.SET_APP_UPDATE_ERROR,
    payload: error,
  });
};

export const setAppUpdateProgress: ActionCreator = ({ dispatch }, { progressPercent, downloadSizeInBytes }) => {
  dispatch({
    type: ActionTypes.SET_APP_UPDATE_PROGRESS,
    payload: {
      downloadSizeInBytes,
      progressPercent,
    },
  });
};

export const setAppUpdateShowing: ActionCreator = ({ dispatch }, showing) => {
  dispatch({
    type: ActionTypes.SET_APP_UPDATE_SHOWING,
    payload: showing,
  });
};

export const setAppUpdateStatus: ActionCreator = ({ dispatch }, { status, version }) => {
  dispatch({
    type: ActionTypes.SET_APP_UPDATE_STATUS,
    payload: {
      status,
      version,
    },
  });
};
