// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { shallowCopyAdaptiveAction } from '../../src/copyUtils/shallowCopyAdaptiveAction';
import { ExternalApi } from '../../src/copyUtils/ExternalApi';

describe('shallowCopyAdaptiveAction', () => {
  const externalApi: ExternalApi = {
    getDesignerId: () => ({ id: '5678' }),
    copyLgTemplate: (id, x) => Promise.resolve(x + '(copy)'),
  };

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
