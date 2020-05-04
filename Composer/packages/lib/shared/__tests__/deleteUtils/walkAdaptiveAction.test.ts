// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { walkAdaptiveAction } from '../../src/walkerUtils';

describe('walkAdaptiveAction', () => {
  it('can walk single action', () => {
    const action = {
      $kind: 'Microsoft.SendActivity',
      activity: 'hello',
    };
    const spy = jest.fn();
    walkAdaptiveAction(action, x => spy(x));

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(action);
  });
});
