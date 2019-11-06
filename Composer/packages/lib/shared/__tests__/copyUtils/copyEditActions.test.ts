// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { copyEditActions } from '../../src/copyUtils/copyEditActions';

describe('#copyEditActions', () => {
  const externalApi = {
    getDesignerId: () => ({ id: '5678' }),
    copyLgTemplate: (id, x) => Promise.resolve(x),
  };

  it('can copy EditActions', async () => {
    const editActions = {
      $type: 'Microsoft.EditActions',
      changeType: 'InsertActions',
      actions: [
        {
          $type: 'Microsoft.BeginDialog',
          dialog: 'AddToDo',
        },
      ],
    };

    expect(await copyEditActions(editActions, externalApi)).toEqual({
      $type: 'Microsoft.EditActions',
      $designer: {
        id: '5678',
      },
      changeType: 'InsertActions',
      actions: [
        {
          $type: 'Microsoft.BeginDialog',
          $designer: {
            id: '5678',
          },
          dialog: 'AddToDo',
        },
      ],
    });
  });
});
