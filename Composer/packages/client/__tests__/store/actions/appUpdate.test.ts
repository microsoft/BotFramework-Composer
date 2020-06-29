// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  setAppUpdateError,
  setAppUpdateProgress,
  setAppUpdateShowing,
  setAppUpdateStatus,
} from '../../../src/store/action/appUpdate';
import { ActionTypes } from '../../../src/constants';

import { runTrivialTests } from './testUtils';

runTrivialTests([
  { action: setAppUpdateError, type: ActionTypes.SET_APP_UPDATE_ERROR, fields: ['error'] },
  {
    action: setAppUpdateProgress,
    type: ActionTypes.SET_APP_UPDATE_PROGRESS,
    fields: ['progressPercent', 'downloadSizeInBytes'],
  },
  { action: setAppUpdateShowing, type: ActionTypes.SET_APP_UPDATE_SHOWING, fields: ['showing'] },
  { action: setAppUpdateStatus, type: ActionTypes.SET_APP_UPDATE_STATUS, fields: ['status', 'version'] },
]);
