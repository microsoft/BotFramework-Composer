// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuFile, DialogInfo, LuDiagnostic } from '@bfc/shared';

export function getReferredFiles(luFiles: LuFile[], dialogs: DialogInfo[]) {
  return luFiles.filter(file => {
    if (dialogs.findIndex(dialog => dialog.luFile === file.id) !== -1) {
      return true;
    }
    return false;
  });
}

export function isValid(diagnostics: LuDiagnostic[]) {
  return diagnostics.length === 0;
}

export function combineMessage(diagnostics: LuDiagnostic[]) {
  return diagnostics.reduce((msg, d) => {
    msg += `${d.text}\n`;
    return msg;
  }, '');
}
