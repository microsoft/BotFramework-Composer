// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  setOpenPendingStatus,
  setCreationFlowStatus,
  saveTemplateId,
  setBotStatus,
} from '../../../src/store/action/project';
import { ActionTypes } from '../../../src/constants';

import { runTrivialTests } from './testUtils';

runTrivialTests([
  { action: setOpenPendingStatus, type: ActionTypes.GET_PROJECT_PENDING },
  {
    action: setCreationFlowStatus,
    type: ActionTypes.SET_CREATION_FLOW_STATUS,
    fields: ['creationFlowStatus'],
    unwrap: true,
  },
  { action: saveTemplateId, type: ActionTypes.SAVE_TEMPLATE_ID, fields: ['templateId'], unwrap: true },
  { action: setBotStatus, type: ActionTypes.UPDATE_BOTSTATUS, fields: ['status'], unwrap: true },
]);
