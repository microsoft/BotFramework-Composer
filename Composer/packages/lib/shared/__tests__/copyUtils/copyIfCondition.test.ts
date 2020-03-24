// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { copyIfCondition } from '../../src/copyUtils/copyIfCondition';
import { externalApiStub as externalApi } from '../jestMocks/externalApiStub';

describe('#copyIfCondition', () => {
  it('can copy normal input', async () => {
    const ifCondition = {
      $type: 'Microsoft.IfCondition',
      condition: 'a == b',
      actions: [
        {
          $type: 'Microsoft.BeginDialog',
          dialog: 'addtodo',
        },
      ],
      elseActions: [
        {
          $type: 'Microsoft.SendActivity',
          activity: '[bfdactivity-1234]',
        },
      ],
    };

    expect(await copyIfCondition(ifCondition, externalApi)).toEqual({
      $type: 'Microsoft.IfCondition',
      $designer: {
        id: '5678',
      },
      condition: 'a == b',
      actions: [
        {
          $type: 'Microsoft.BeginDialog',
          $designer: {
            id: '5678',
          },
          dialog: 'addtodo',
        },
      ],
      elseActions: [
        {
          $type: 'Microsoft.SendActivity',
          $designer: {
            id: '5678',
          },
          activity: '[bfdactivity-1234]',
        },
      ],
    });
  });
});
