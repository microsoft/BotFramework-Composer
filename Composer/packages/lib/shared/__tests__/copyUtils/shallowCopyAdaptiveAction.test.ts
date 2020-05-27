// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { shallowCopyAdaptiveAction } from '../../src/copyUtils/shallowCopyAdaptiveAction';
import { externalApiStub as externalApi } from '../__mocks__/externalApiStub';

describe('shallowCopyAdaptiveAction', () => {
  it('can copy BeginDialog', () => {
    const beginDialog = {
      $kind: 'Microsoft.BeginDialog',
      dialog: 'addtodo',
    };

    expect(shallowCopyAdaptiveAction(beginDialog, externalApi)).toEqual({
      $kind: 'Microsoft.BeginDialog',
      $designer: { id: '5678' },
      dialog: 'addtodo',
    });
  });
});
