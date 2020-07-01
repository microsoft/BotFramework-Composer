// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator, DialogSetting } from '../types';
import { ActionTypes } from '../../constants';

export const setSettings: ActionCreator = async ({ dispatch }, projectId: string, settings: DialogSetting) => {
  dispatch({
    type: ActionTypes.SYNC_ENV_SETTING,
    payload: {
      projectId,
      settings,
    },
  });
};
