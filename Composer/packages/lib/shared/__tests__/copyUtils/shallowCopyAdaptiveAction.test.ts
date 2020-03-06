// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { shallowCopyAdaptiveAction } from '../../src/copyUtils/shallowCopyAdaptiveAction';
import { externalApiStub as externalApi } from '../jestMocks/externalApiStub';

describe('shallowCopyAdaptiveAction', () => {
  it('can copy BeginDialog', () => {
    const beginDialog = {
      $type: 'Microsoft.BeginDialog',
      dialog: 'addtodo',
    };

    expect(shallowCopyAdaptiveAction(beginDialog, externalApi)).toEqual({
      $type: 'Microsoft.BeginDialog',
      $designer: { id: '5678' },
      dialog: 'addtodo',
    });
  });
});
