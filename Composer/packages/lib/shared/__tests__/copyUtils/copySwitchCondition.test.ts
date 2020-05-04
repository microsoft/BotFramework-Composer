// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { copySwitchCondition } from '../../src/copyUtils/copySwitchCondition';
import { externalApiStub as externalApi } from '../__mocks__/externalApiStub';

describe('#copySwitchCondition', () => {
  it('can copy cases and default in input', async () => {
    const switchCondition = {
      $kind: 'Microsoft.SwitchCondition',
      condition: 'dialog.x',
      default: [
        {
          $kind: 'Microsoft.BeginDialog',
          dialog: 'addtodo',
        },
        {
          $kind: 'Microsoft.IfCondition',
          actions: [
            {
              $kind: 'Microsoft.SendActivity',
              activity: '[SendActivity_1234]',
            },
          ],
        },
      ],
      cases: [
        {
          value: '0',
          actions: [
            {
              $kind: 'Microsoft.BeginDialog',
              dialog: 'addtodo',
            },
          ],
        },
        {
          value: '1',
          actions: [
            {
              $kind: 'Microsoft.SwitchCondition',
              condition: 'a.b',
              default: [],
              cases: [],
            },
          ],
        },
      ],
    };

    expect(await copySwitchCondition(switchCondition, externalApi)).toEqual({
      $kind: 'Microsoft.SwitchCondition',
      $designer: {
        id: '5678',
      },
      condition: 'dialog.x',
      default: [
        {
          $kind: 'Microsoft.BeginDialog',
          $designer: {
            id: '5678',
          },
          dialog: 'addtodo',
        },
        {
          $kind: 'Microsoft.IfCondition',
          $designer: {
            id: '5678',
          },
          actions: [
            {
              $kind: 'Microsoft.SendActivity',
              $designer: {
                id: '5678',
              },
              activity: '[SendActivity_1234]',
            },
          ],
        },
      ],
      cases: [
        {
          value: '0',
          actions: [
            {
              $kind: 'Microsoft.BeginDialog',
              $designer: {
                id: '5678',
              },
              dialog: 'addtodo',
            },
          ],
        },
        {
          value: '1',
          actions: [
            {
              $kind: 'Microsoft.SwitchCondition',
              $designer: {
                id: '5678',
              },
              condition: 'a.b',
              default: [],
              cases: [],
            },
          ],
        },
      ],
    });
  });
});
