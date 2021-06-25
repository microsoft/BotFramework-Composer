// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuFile, DialogInfo, Diagnostic, DiagnosticSeverity } from '@bfc/shared';

import { getReferredLuFiles, checkLuisBuild } from '../luUtil';

describe('getReferredLuFiles', () => {
  it('returns referred luFiles from dialog', () => {
    const dialogs = [{ luFile: 'a' }];
    const luFiles = [{ id: 'a.en-us', content: 'xxx' }, { id: 'b.en-us' }, { id: 'c.en-us' }];
    const referred = getReferredLuFiles(luFiles as LuFile[], dialogs as DialogInfo[]);
    expect(referred.length).toEqual(1);
    expect(referred[0].id).toEqual('a.en-us');
  });
});

it('check the lu files before publish', () => {
  const dialogs = [{ luFile: 'a' }] as DialogInfo[];
  const diagnostics: Diagnostic[] = [];
  const luFiles = [
    { id: 'a.en-us', diagnostics, content: 'test', intents: [{ Name: '1', Body: '1' }], empty: false },
    { id: 'b.en-us', diagnostics },
    { id: 'c.en-us', diagnostics },
  ] as LuFile[];
  const referred = checkLuisBuild(luFiles, dialogs);
  expect(referred.length).toEqual(1);

  expect(referred[0].id).toEqual('a.en-us');

  luFiles[0].diagnostics = [{ message: 'wrong', severity: DiagnosticSeverity.Error }] as Diagnostic[];
  expect(() => {
    checkLuisBuild(luFiles, dialogs);
  }).toThrowError(/wrong/);

  luFiles[0].empty = false;
  luFiles[0].diagnostics = [];
  expect(checkLuisBuild(luFiles, dialogs)[0].id).toEqual('a.en-us');
});
