// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { copySwitchCondition } from '../../src/copyUtils/copySwitchCondition';
import { externalApiStub as externalApi } from '../jestMocks/externalApiStub';

describe('#copySwitchCondition', () => {
  it('can copy cases and default in input', async () => {
    const switchCondition = {
      $type: 'Microsoft.SwitchCondition',
      condition: 'dialog.x',
      default: [
        {
          $type: 'Microsoft.BeginDialog',
          dialog: 'addtodo',
        },
        {
          $type: 'Microsoft.IfCondition',
          actions: [
            {
              $type: 'Microsoft.SendActivity',
              activity: '[bfdactivity-1234]',
            },
          ],
        },
      ],
      cases: [
        {
          value: '0',
          actions: [
            {
              $type: 'Microsoft.BeginDialog',
              dialog: 'addtodo',
            },
          ],
        },
        {
          value: '1',
          actions: [
            {
              $type: 'Microsoft.SwitchCondition',
              condition: 'a.b',
              default: [],
              cases: [],
            },
          ],
        },
      ],
    };

    expect(await copySwitchCondition(switchCondition, externalApi)).toEqual({
      $type: 'Microsoft.SwitchCondition',
      $designer: {
        id: '5678',
      },
      condition: 'dialog.x',
      default: [
        {
          $type: 'Microsoft.BeginDialog',
          $designer: {
            id: '5678',
          },
          dialog: 'addtodo',
        },
        {
          $type: 'Microsoft.IfCondition',
          $designer: {
            id: '5678',
          },
          actions: [
            {
              $type: 'Microsoft.SendActivity',
              $designer: {
                id: '5678',
              },
              activity: '[bfdactivity-1234]',
            },
          ],
        },
      ],
      cases: [
        {
          value: '0',
          actions: [
            {
              $type: 'Microsoft.BeginDialog',
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
              $type: 'Microsoft.SwitchCondition',
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
