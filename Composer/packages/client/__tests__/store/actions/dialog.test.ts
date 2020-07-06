// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  removeDialog,
  updateDialogBase,
  createDialogBegin,
  createDialog,
  createDialogCancel,
} from '../../../src/store/action/dialog';
import { ActionTypes } from '../../../src/constants';

import { runMinorTests } from './testUtils';

jest.useFakeTimers();

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

describe('the createDialog actions', () => {
  describe('with a function in the dialogCompleteCallback', () => {
    const mockStore = {
      getState: jest.fn(),
      dispatch: jest.fn(),
    };
    const dialogCompleteCallback = jest.fn();

    mockStore.getState.mockReturnValue({ onCreateDialogComplete: dialogCompleteCallback });

    it('dispatches createDialog', async () => {
      const id = '1234';
      const payload = { id, content: 'content' };
      await createDialog(mockStore, payload);

      expect(mockStore.dispatch).toHaveBeenCalledWith({
        type: ActionTypes.CREATE_DIALOG,
        payload,
      });
      jest.runAllTimers();
      expect(dialogCompleteCallback).toHaveBeenCalledWith(id);
    });

    it('dispatches createDialogCancel', () => {
      createDialogCancel(mockStore);

      expect(mockStore.dispatch).toHaveBeenCalledWith({
        type: ActionTypes.CREATE_DIALOG_CANCEL,
      });
      jest.runAllTimers();
      expect(dialogCompleteCallback).toHaveBeenCalledWith(null);
    });
  });

  describe('with nothing in the dialogCompleteCallback', () => {
    const mockStore = {
      getState: jest.fn(),
      dispatch: jest.fn(),
    };
    mockStore.getState.mockReturnValue({ onCreateDialogComplete: null });

    it('dispatches createDialog', async () => {
      const id = '1234';
      const payload = { id, content: 'content' };
      await createDialog(mockStore, payload);

      expect(mockStore.dispatch).toHaveBeenCalledWith({
        type: ActionTypes.CREATE_DIALOG,
        payload,
      });
      jest.runAllTimers();
    });

    it('dispatches createDialogCancel', () => {
      createDialogCancel(mockStore);

      expect(mockStore.dispatch).toHaveBeenCalledWith({
        type: ActionTypes.CREATE_DIALOG_CANCEL,
      });
      jest.runAllTimers();
    });
  });
});
