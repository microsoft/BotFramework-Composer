// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { shallowCopyAdaptiveAction } from '../../src/copyUtils/shallowCopyAdaptiveAction';

import { externalApiStub as externalApi } from './externalApiStub';

describe('shallowCopyAdaptiveAction', () => {
  it('can copy BeginDialog', () => {
    const beginDialog = {
      $type: 'Microsoft.BeginDialog',
      dialog: 'AddToDo',
    };

    expect(shallowCopyAdaptiveAction(beginDialog, externalApi)).toEqual({
      $type: 'Microsoft.BeginDialog',
      $designer: { id: '5678' },
      dialog: 'AddToDo',
    });
  });
});
