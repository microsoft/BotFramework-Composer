// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionTypes } from '../../../src/constants';
import { ActionCreator } from '../../../src/store/types';

type SimpleTest = {
  action: ActionCreator;
  actionType: ActionTypes;
  payload: {};
  output?: {};
};

export function runMinorTests(tests: SimpleTest[]) {
  for (const { action, actionType, payload, output } of tests) {
    it(`dispatches the ${actionType} action`, () => expect(action).toDispatch(actionType, payload, output));
  }
}
