// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ShellApi } from '@bfc/shared';

const fn = () => ({} as any);
const fnList = () => [] as any[];
const fnPromise = () => Promise.resolve({} as any);

export const ShellApiStub: ShellApi = {
  getDialog: fn,
  saveDialog: fn,
  saveData: fn,
  navTo: fn,
  onFocusSteps: fn,
  onFocusEvent: fn,
  onSelect: fn,
  getLgTemplates: fnList,
  copyLgTemplate: fnPromise,
  addLgTemplate: fnPromise,
  updateLgTemplate: fnPromise,
  removeLgTemplate: fnPromise,
  removeLgTemplates: fnPromise,
  getLuIntent: fn,
  getLuIntents: fnList,
  addLuIntent: fnPromise,
  updateLuIntent: fnPromise,
  removeLuIntent: fn,
  updateRegExIntent: fn,
  createDialog: fnPromise,
  addCoachMarkRef: fn,
  onCopy: fn,
  undo: fn,
  redo: fn,
  updateUserSettings: fn,
  addSkillDialog: fnPromise,
  announce: fn,
  displayManifestModal: fn,
};

describe('ShellApiStub', () => {
  it('be truthy.', () => {
    expect(ShellApiStub).toBeTruthy();
  });
});
