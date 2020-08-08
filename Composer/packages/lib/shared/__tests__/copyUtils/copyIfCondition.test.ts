// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { copyIfCondition } from '../../src/copyUtils/copyIfCondition';
import { externalApiStub as externalApi } from '../__mocks__/externalApiStub';

describe('#copyIfCondition', () => {
  it('can copy normal input', () => {
    const ifCondition = {
      $kind: 'Microsoft.IfCondition',
      condition: 'a == b',
      actions: [
        {
          $kind: 'Microsoft.BeginDialog',
          dialog: 'addtodo',
        },
      ],
      elseActions: [
        {
          $kind: 'Microsoft.SendActivity',
          activity: '[SendActivity_1234]',
        },
      ],
    };

    expect(copyIfCondition(ifCondition, externalApi)).toEqual({
      $kind: 'Microsoft.IfCondition',
      $designer: {
        id: '5678',
      },
      condition: 'a == b',
      actions: [
        {
          $kind: 'Microsoft.BeginDialog',
          $designer: {
            id: '5678',
          },
          dialog: 'addtodo',
        },
      ],
      elseActions: [
        {
          $kind: 'Microsoft.SendActivity',
          $designer: {
            id: '5678',
          },
          activity: '[SendActivity_1234]',
        },
      ],
    });
  });
});
