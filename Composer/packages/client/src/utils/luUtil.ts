import { LuFile, DialogInfo, Diagnostic } from '../store/types';

export function getReferredFiles(luFiles: LuFile[], dialogs: DialogInfo[]) {
  return luFiles.filter(file => {
    if (dialogs.findIndex(dialog => dialog.referredLUFile === file.id) !== -1) {
      return true;
    }
    return false;
  });
}

export function isValid(diagnostics: Diagnostic[]) {
  return diagnostics.length === 0;
}

export function combineMessage(diagnostics: Diagnostic[]) {
  return diagnostics.reduce((msg, d) => {
    msg += `${d.message}\n`;
    return msg;
  }, '');
}
