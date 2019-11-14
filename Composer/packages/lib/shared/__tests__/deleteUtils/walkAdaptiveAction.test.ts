// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { walkAdaptiveAction } from '../../src/deleteUtils/walkAdaptiveAction';

describe('walkAdaptiveAction', () => {
  it('can walk single action', () => {
    const action = {
      $type: 'Microsoft.SendActivity',
      prompt: 'hello',
    };
    const spy = jest.fn();
    walkAdaptiveAction(action, x => spy(x));

    expect(spy).toBeCalledWith(action);
  });
});
