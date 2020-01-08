// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ExternalUpdate } from '@bfc/shared';

import { ActionTypes } from '../../constants';
import { ActionCreator } from '../types';

export const recordExternalUpdate: ActionCreator = async ({ dispatch }, externalUpdate: ExternalUpdate) => {
  dispatch({
    type: ActionTypes.RECORD_EXTERNAL_UPDATE,
    payload: { externalUpdate },
  });
};
