// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { walkAdaptiveActionList } from '../../src/deleteUtils/walkAdaptiveActionList';

describe('walkAdaptiveAction', () => {
  it('can walk action list', () => {
    const actions = [
      {
        $type: 'Microsoft.SendActivity',
        prompt: 'hello',
      },
      {
        $type: 'Microsoft.ChoiceInput',
        prompt: 'hello',
      },
    ];
    const spy = jest.fn();
    walkAdaptiveActionList(actions, x => spy(x));

    expect(spy).toBeCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, actions[0]);
    expect(spy).toHaveBeenNthCalledWith(2, actions[1]);
  });
});
