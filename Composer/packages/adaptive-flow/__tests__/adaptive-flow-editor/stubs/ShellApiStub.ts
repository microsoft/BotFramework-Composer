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
  updateLgFile: fnPromise,
  debouncedUpdateLgTemplate: fnPromise,
  getLuIntent: fn,
  getLuIntents: fnList,
  addLuIntent: fnPromise,
  updateLuIntent: fnPromise,
  removeLuIntent: fn,
  updateLuFile: fnPromise,
  debouncedUpdateLuIntent: fnPromise,
  renameLuIntent: fnPromise,
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
  constructAction: fnPromise,
  constructActions: fnPromise,
  copyAction: fnPromise,
  copyActions: fnPromise,
  deleteAction: fnPromise,
  deleteActions: fnPromise,
  actionsContainLuIntent: fn,
  updateQnaContent: fnPromise,
  renameRegExIntent: fnPromise,
  updateIntentTrigger: fnPromise,
  commitChanges: fnPromise,
  updateDialogSchema: fnPromise,
  createTrigger: fnPromise,
  updateSkillSetting: fnPromise,
  updateFlowZoomRate: fnPromise,
};

describe('ShellApiStub', () => {
  it('be truthy.', () => {
    expect(ShellApiStub).toBeTruthy();
  });
});
