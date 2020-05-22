// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuFile, DialogInfo, Diagnostic, DiagnosticSeverity } from '@bfc/shared';

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
          { intent: 'dias_trigger', dialogs: ['dia5', 'dia6'] },
          { intent: 'no_dialog', dialogs: [] },
          { intent: 'dialog_without_lu', dialogs: ['dialog_without_lu'] },
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
      { id: 'main.en-us' },
      { id: 'dia1.en-us' },
      { id: 'dia2.en-us' },
      { id: 'dia3.en-us' },
      { id: 'dia5.en-us' },
      { id: 'dia6.en-us' },
      { id: 'start_dialog_without_intent.en-us' },
    ];
    const config = createCrossTrainConfig(dialogs as DialogInfo[], luFiles as LuFile[]);
    expect(config.rootIds.length).toEqual(1);
    expect(config.rootIds[0]).toEqual('main.en-us.lu');
    expect(config.triggerRules['main.en-us.lu'].dia1_trigger).toEqual('dia1.en-us.lu');
    expect(config.triggerRules['main.en-us.lu'].no_dialog).toEqual('');
    expect(config.triggerRules['main.en-us.lu']['']).toEqual('start_dialog_without_intent.en-us.lu');
    expect(config.triggerRules['main.en-us.lu'].dia1_trigger).toEqual('dia1.en-us.lu');
    expect(config.triggerRules['main.en-us.lu'].dias_trigger.length).toBe(2);
    expect(config.triggerRules['dia1.en-us.lu'].dia3_trigger).toEqual('dia3.en-us.lu');
    expect(config.triggerRules['dia1.en-us.lu']['dia4.en-us.lu']).toBeUndefined();
    expect(config.triggerRules['main.en-us.lu'].dialog_without_lu).toEqual('');
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

    luFiles[0].diagnostics = [{ message: 'wrong', severity: DiagnosticSeverity.Error }] as Diagnostic[];
    expect(() => {
      checkLuisPublish(luFiles, dialogs);
    }).toThrowError(/wrong/);
  });
});
