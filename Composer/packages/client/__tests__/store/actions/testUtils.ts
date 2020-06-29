// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import isEmpty from 'lodash/isEmpty';

import { ActionTypes } from '../../../src/constants';
import { ActionCreator } from '../../../src/store/types';

type SimpleTest = {
  action: ActionCreator;
  type: ActionTypes;
  fields?: string[];
  unwrap?: boolean;
};

// useful for testing actions that do no logic, just dispatch with a given payload
export function testTrivial(action: ActionCreator, intendedType: ActionTypes, mockPayload: {} = {}, unwrap = false) {
  const mockDispatch = jest.fn();

  action(
    { dispatch: mockDispatch, getState: jest.fn() },
    unwrap ? mockPayload?.[Object.keys(mockPayload)?.[0]] : mockPayload
  );

  if (isEmpty(mockPayload)) {
    expect(mockDispatch).toHaveBeenCalledWith({
      type: intendedType,
    });
  } else {
    expect(mockDispatch).toHaveBeenCalledWith({
      type: intendedType,
      payload: mockPayload,
    });
  }
}

export function runTrivialTests(tests: SimpleTest[]) {
  for (const { action, type, fields, unwrap } of tests) {
    const payload = {};
    if (fields != null) {
      for (const field of fields) {
        payload[field] = {};
      }
    }

    it(`performs the action ${type}`, () => {
      testTrivial(action, type, payload, unwrap);
    });
  }
}
