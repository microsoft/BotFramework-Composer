// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuFile, DialogInfo, Diagnostic } from '@bfc/shared';

import { getReferredFiles, checkLuisPublish, createCrossTrainConfig } from '../../src/utils/luUtil';

describe('getReferredFiles', () => {
  it('returns referred luFiles from dialog', () => {
    const dialogs = [{ luFile: 'a' }];
    const luFiles = [{ id: 'a.en-us' }, { id: 'b.en-us' }, { id: 'c.en-us' }];
    const referred = getReferredFiles(luFiles as LuFile[], dialogs as DialogInfo[]);
    expect(referred.length).toEqual(1);
    expect(referred[0].id).toEqual('a.en-us');
  });

  it('should create crosstrain config', () => {
    const dialogs = [
      {
        id: 'main',
        luFile: 'main',
        isRoot: true,
        intentTriggers: [
          { intent: 'dia1_trigger', dialogs: ['dia1'] },
          { intent: 'dia2_trigger', dialogs: ['dia2'] },
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
        id: 'start_dialog_without_intent',
        luFile: 'start_dialog_without_intent',
        intentTriggers: [],
      },
    ];
    const luFiles = [
      { id: 'main.en-us' },
      { id: 'dia1.en-us' },
      { id: 'dia2.en-us' },
      { id: 'dia3.en-us' },
      { id: 'start_dialog_without_intent.en-us' },
    ];
    const config = createCrossTrainConfig(dialogs as DialogInfo[], luFiles as LuFile[]);
    expect(config.rootIds.length).toEqual(1);
    expect(config.rootIds[0]).toEqual('main.en-us.lu');
    expect(config.triggerRules['main.en-us.lu']['dia1.en-us.lu']).toEqual('dia1_trigger');
    expect(config.triggerRules['main.en-us.lu']['']).toEqual('no_dialog');
    expect(config.triggerRules['main.en-us.lu']['start_dialog_without_intent.en-us.lu']).toEqual('');
    expect(config.triggerRules['main.en-us.lu']['dia1.en-us.lu']).toEqual('dia1_trigger');
    expect(config.triggerRules['dia1.en-us.lu']['dia3.en-us.lu']).toEqual('dia3_trigger');
    expect(config.triggerRules['dia1.en-us.lu']['dia4.en-us.lu']).toBeUndefined();
  });

  it('check the lu files before publish', () => {
    const dialogs = [{ luFile: 'a' }] as DialogInfo[];
    const diagnostics: Diagnostic[] = [];
    const luFiles = [
      { id: 'a.en-us', diagnostics, content: 'test', intents: [{ Name: '1', Body: '1' }] },
      { id: 'b.en-us', diagnostics },
      { id: 'c.en-us', diagnostics },
    ] as LuFile[];
    const referred = checkLuisPublish(luFiles, dialogs);
    expect(referred.length).toEqual(1);

    expect(referred[0].id).toEqual('a.en-us');

    luFiles[0].diagnostics = [{ message: 'wrong' }] as Diagnostic[];
    expect(() => {
      checkLuisPublish(luFiles, dialogs);
    }).toThrowError(/wrong/);
  });
});
