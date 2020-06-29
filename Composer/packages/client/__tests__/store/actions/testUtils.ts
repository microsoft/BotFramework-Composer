// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionTypes } from '../../../src/constants';
import { ActionCreator } from '../../../src/store/types';

type SimpleTest = {
  action: ActionCreator;
  type: ActionTypes;
  fieldName?: string;
};

// useful for testing actions that do no logic, just dispatch with a given payload
export function testTrivial(action: ActionCreator, intendedType: ActionTypes, mockPayloadName: string | null = null) {
  const mockDispatch = jest.fn();
  const mockPayload = {
    // note: when mockPayloadName is null, we don't care about this object anyway
    [mockPayloadName ?? '']: {},
  };

  action({ dispatch: mockDispatch, getState: jest.fn() }, {});

  if (mockPayloadName !== null) {
    expect(mockDispatch).toHaveBeenCalledWith({
      type: intendedType,
      payload: mockPayload,
    });
  } else {
    expect(mockDispatch).toHaveBeenCalledWith({
      type: intendedType,
    });
  }
}

export function runTrivialTests(tests: SimpleTest[]) {
  for (const { action, type, fieldName } of tests) {
    it(`performs the action ${type}`, () => {
      testTrivial(action, type, fieldName);
    });
  }
}
