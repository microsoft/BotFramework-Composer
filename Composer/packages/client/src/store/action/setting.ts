// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator, DialogSetting } from '../types';

import { ActionTypes } from './../../constants/index';

export const setSettings: ActionCreator = async (
  { dispatch },
  projectId: string,
  botName: string,
  settings: DialogSetting
) => {
  dispatch({
    type: ActionTypes.SYNC_ENV_SETTING,
    payload: {
      projectId,
      botName,
      settings,
    },
  });
};
