// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, LuFile } from '@bfc/shared';

import { createCrossTrainConfig } from '../buildUtil';

describe('createCrossTrainConfig', () => {
  it('should create crosstrain config', () => {
    const dialogs = [
      {
        id: 'main',
        luFile: 'main',
        isRoot: true,
        intentTriggers: [
          { intent: 'dia1_trigger', dialogs: ['dia1'] },
          { intent: 'dia2_trigger', dialogs: ['dia2'] },
          { intent: 'dias_trigger', dialogs: ['dia5', 'dia6'] },
          { intent: 'no_dialog', dialogs: [] },
          { intent: '', dialogs: ['start_dialog_without_intent'] },
        ],
      },
      {
        id: 'dia1',
        luFile: 'dia1',
        intentTriggers: [
          { intent: 'dia3_trigger', dialogs: ['dia3'] },
          { intent: 'dia4_trigger', dialogs: ['dia4'] },
        ],
      },
      {
        id: 'dia2',
        luFile: 'dia2',
        intentTriggers: [],
      },
      {
        id: 'dia3',
        luFile: 'dia3',
        intentTriggers: [],
      },
      {
        id: 'dia4',
        luFile: 'dia4',
        intentTriggers: [],
      },
      {
        id: 'dia5',
        luFile: 'dia5',
        intentTriggers: [],
      },
      {
        id: 'dia6',
        luFile: 'dia6',
        intentTriggers: [],
      },
      {
        id: 'start_dialog_without_intent',
        luFile: 'start_dialog_without_intent',
        intentTriggers: [],
      },
      {
        id: 'dialog_without_lu',
        intentTriggers: [],
      },
    ];
    const luFiles = [
      {
        id: 'main.en-us',
        intents: [
          { Name: 'dia1_trigger' },
          { Name: 'dia2_trigger' },
          { Name: 'dias_trigger' },
          { Name: 'no_dialog' },
          { Name: 'dialog_without_lu' },
        ],
      },
      { id: 'dia1.en-us', intents: [{ Name: 'dia3_trigger' }, { Name: 'dia4_trigger' }] },
      { id: 'dia2.en-us' },
      { id: 'dia3.en-us' },
      { id: 'dia5.en-us' },
      { id: 'dia6.en-us' },
    ];
    const config = createCrossTrainConfig(dialogs as DialogInfo[], luFiles as LuFile[], ['en-us']);
    expect(config['main.en-us'].rootDialog).toBeTruthy();
    expect(config['main.en-us'].triggers.dia1_trigger[0]).toEqual('dia1.en-us');
    expect(config['main.en-us'].triggers.no_dialog.length).toEqual(0);
    expect(config['main.en-us'].triggers.dia2_trigger[0]).toEqual('dia2.en-us');
    expect(config['main.en-us'].triggers.dias_trigger.length).toBe(2);
  });
});
