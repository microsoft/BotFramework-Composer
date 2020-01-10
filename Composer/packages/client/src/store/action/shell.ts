// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ExternalUpdate } from '@bfc/shared';

import { ActionTypes } from '../../constants';
import { ActionCreator } from '../types';

export const setUpdateStatus: ActionCreator = async ({ dispatch }, externalUpdate: ExternalUpdate) => {
  dispatch({
    type: ActionTypes.SET_UPDATE_STATUS,
    payload: { externalUpdate },
  });
};
