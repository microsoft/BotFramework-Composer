// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { removeDialog, updateDialogBase, createDialogBegin } from '../../../src/store/action/dialog';
import { ActionTypes } from '../../../src/constants';

import { runMinorTests } from './testUtils';

const ACTION_TESTS = [
  { action: removeDialog, actionType: ActionTypes.REMOVE_DIALOG, payload: {}, output: { id: {} } },
  { action: updateDialogBase, actionType: ActionTypes.UPDATE_DIALOG, payload: { id: {}, content: {} } },
  {
    action: createDialogBegin,
    actionType: ActionTypes.CREATE_DIALOG_BEGIN,
    payload: 123,
    output: { actionsSeed: 123, onComplete: {} },
  },
];

describe('simple actions', () => runMinorTests(ACTION_TESTS));
