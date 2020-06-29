// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  setOpenPendingStatus,
  setCreationFlowStatus,
  saveTemplateId,
  setBotStatus,
  fetchProjectById,
} from '../../../src/store/action/project';
import { ActionTypes } from '../../../src/constants';
import httpClient from '../../../src/utils/httpUtil';

import { runTrivialTests } from './testUtils';

jest.mock('./../../utils/httpUtil');
const store = { dispatch: jest.fn(), getState: jest.fn() };
const PROJECT_ID = '123456.6789';

runTrivialTests([
  { action: setOpenPendingStatus, type: ActionTypes.GET_PROJECT_PENDING },
  { action: setCreationFlowStatus, type: ActionTypes.SET_CREATION_FLOW_STATUS, fieldName: 'creationFlowStatus' },
  { action: saveTemplateId, type: ActionTypes.SAVE_TEMPLATE_ID, fieldName: 'templateId' },
  { action: setBotStatus, type: ActionTypes.UPDATE_BOTSTATUS, fieldName: 'status' },
]);

it('can fetch a project by ID', () => {
  fetchProjectById(store, PROJECT_ID);
  expect(httpClient.get).toHaveBeenCalledWith(`/projects/${PROJECT_ID}`);
  expect(store.dispatch).toHaveBeenCalledWith({
    type: ActionTypes.GET_PROJECT_SUCCESS,
    payload: {
      projectId: PROJECT_ID,
    },
  });
});
