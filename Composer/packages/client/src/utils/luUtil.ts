import { LuFile, DialogInfo, LuDiagnostic } from '../store/types';

export function getReferredFiles(luFiles: LuFile[], dialogs: DialogInfo[]) {
  return luFiles.filter(file => {
    if (dialogs.findIndex(dialog => dialog.referredLUFile === file.id) !== -1) {
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
