// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { copyAdaptiveAction } from '../src/copyUtils';
import { ExternalApi } from '../src/copyUtils/ExternalApi';

describe('copyAdaptiveAction', () => {
  const externalApi: ExternalApi = {
    getDesignerId: () => ({ id: '5678' }),
    copyLgTemplate: x => Promise.resolve(x + '(copy)'),
  };

  it('should return {} when input is invalid', async () => {
    expect(await copyAdaptiveAction(null, externalApi)).toEqual({});
    expect(await copyAdaptiveAction({}, externalApi)).toEqual({});
    expect(await copyAdaptiveAction({ name: 'hi' }, externalApi)).toEqual({});
  });

  it('can copy BeginDialog', async () => {
    const beginDialog = {
      $type: 'Microsoft.BeginDialog',
      dialog: 'AddToDo',
    };

    expect(await copyAdaptiveAction(beginDialog, externalApi)).toEqual({
      $type: 'Microsoft.BeginDialog',
      $designer: { id: '5678' },
      dialog: 'AddToDo',
    });
  });

  it('can copy SendActivity', async () => {
    const sendActivity = {
      $type: 'Microsoft.SendActivity',
      activity: '[bfdactivity-1234]',
    };

    expect(await copyAdaptiveAction(sendActivity, externalApi)).toEqual({
      $type: 'Microsoft.SendActivity',
      $designer: { id: '5678' },
      activity: '[bfdactivity-1234](copy)',
    });
  });

  it('can copy TextInput', async () => {
    const promptText = {
      $type: 'Microsoft.TextInput',
      $designer: {
        id: '844184',
        name: 'Prompt for text',
      },
      maxTurnCount: 3,
      alwaysPrompt: false,
      allowInterruptions: 'true',
      outputFormat: 'none',
      prompt: '[bfdprompt-1234]',
      invalidPrompt: '[bfdinvalidPrompt-1234]',
    };

    expect(await copyAdaptiveAction(promptText, externalApi)).toEqual({
      $type: 'Microsoft.TextInput',
      $designer: {
        id: '5678',
      },
      maxTurnCount: 3,
      alwaysPrompt: false,
      allowInterruptions: 'true',
      outputFormat: 'none',
      prompt: '[bfdprompt-1234](copy)',
      invalidPrompt: '[bfdinvalidPrompt-1234](copy)',
    });
  });

  it('can copy IfCondition', async () => {
    const ifCondition = {
      $type: 'Microsoft.IfCondition',
      condition: 'a == b',
      actions: [
        {
          $type: 'Microsoft.BeginDialog',
          dialog: 'AddToDo',
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
      elseActions: [],
    };

    expect(await copyAdaptiveAction(ifCondition, externalApi)).toEqual({
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
          dialog: 'AddToDo',
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
              activity: '[bfdactivity-1234](copy)',
            },
          ],
        },
      ],
      elseActions: [],
    });
  });

  it('can copy SwitchCondition', async () => {
    const switchCondition = {
      $type: 'Microsoft.SwitchCondition',
      condition: 'dialog.x',
      default: [
        {
          $type: 'Microsoft.BeginDialog',
          dialog: 'AddToDo',
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
              dialog: 'AddToDo',
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

    expect(await copyAdaptiveAction(switchCondition, externalApi)).toEqual({
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
          dialog: 'AddToDo',
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
              activity: '[bfdactivity-1234](copy)',
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
              dialog: 'AddToDo',
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
