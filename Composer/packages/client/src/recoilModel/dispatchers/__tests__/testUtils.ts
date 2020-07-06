// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, RecoilState } from 'recoil';

const mockSet = jest.fn();

export const mockCallback: CallbackInterface = {
  set: mockSet,
  reset: jest.fn(),
  gotoSnapshot: jest.fn(),
  snapshot: {
    getLoadable: jest.fn(),
    getPromise: jest.fn(),
    map: jest.fn(),
    asyncMap: jest.fn(),
  },
};

export function testAtomUpdate<T>(atom: RecoilState<T>, before: T, after: T) {
  const setCall = mockSet.mock.calls[mockSet.mock.calls.length - 1];
  expect(setCall[0]).toBe(atom);

  const updateResult = setCall[1];

  if (typeof updateResult === 'function') {
    expect(updateResult(before)).toEqual(after);
  } else {
    expect(updateResult).toEqual(after);
  }
}
