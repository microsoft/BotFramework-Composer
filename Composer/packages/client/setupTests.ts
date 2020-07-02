// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from './src/store/types';
import { ActionTypes } from './src/constants';
import isEqual from 'lodash/isEqual';

expect.extend({
  toBeDispatchedWith(dispatch: jest.Mock, type: string, payload: any, error?: any) {
    if (this.isNot) {
      expect(dispatch).not.toHaveBeenCalledWith({
        type,
        payload,
        error,
      });
    } else {
      expect(dispatch).toHaveBeenCalledWith({
        type,
        payload,
        error,
      });
    }

    return {
      pass: !this.isNot,
      message: () => 'dispatch called with correct type and payload',
    };
  },

  // runs a simple test for ActionCreators that just take in an argument and dispatch an action with that as its payload;
  // omit the testPayload argument to test actions that just pass the arguments through intact
  async toDispatch(actionCreator: ActionCreator, actionType: ActionTypes, testArguments: {}, testPayload?: {}) {
    const dispatch: jest.Mock = jest.fn();
    const error = {};

    await actionCreator({ dispatch, getState: jest.fn() }, testArguments, error);

    if (dispatch.mock.calls.length !== 1) {
      return { pass: false, message: () => `expected the dispatch function to be called` };
    }

    const call = dispatch.mock.calls[0][0];

    if (testPayload == null) testPayload = testArguments;

    if (call.type !== actionType) {
      return {
        pass: false,
        message: () =>
          `expected the action ${actionType} to be dispatched; was ${dispatch.mock.calls[0][0].type} instead`,
      };
    } else if (!isEqual(call.payload, testPayload)) {
      return {
        pass: false,
        message: () =>
          `expected ${actionType} to be dispatched with ${JSON.stringify(testPayload)};` +
          ` received ${JSON.stringify(call.payload)}`,
      };
    } else
      return {
        pass: true,
        message: () => `${actionType} dispatched with ${JSON.stringify(testPayload)}`,
      };
  },
});

// for tests using Electron IPC to talk to main process
(window as any).ipcRenderer = { on: jest.fn() };
