// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { copyEditActions } from '../../src/copyUtils/copyEditActions';
import { externalApiStub as externalApi } from '../__mocks__/externalApiStub';

describe('#copyEditActions', () => {
  it('can copy EditActions', async () => {
    const editActions = {
      $kind: 'Microsoft.EditActions',
      changeType: 'InsertActions',
      actions: [
        {
          $kind: 'Microsoft.BeginDialog',
          dialog: 'addtodo',
        },
      ],
    };

    expect(await copyEditActions(editActions, externalApi)).toEqual({
      $kind: 'Microsoft.EditActions',
      $designer: {
        id: '5678',
      },
      changeType: 'InsertActions',
      actions: [
        {
          $kind: 'Microsoft.BeginDialog',
          $designer: {
            id: '5678',
          },
          dialog: 'addtodo',
        },
      ],
    });
  });
});
