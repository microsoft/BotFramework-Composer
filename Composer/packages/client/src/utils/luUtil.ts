export function getReferredFiles(luFiles, dialogs) {
  return luFiles.filter(file => {
    if (dialogs.findIndex(dialog => dialog.luFile === file.id) !== -1) {
      return true;
    }
    return false;
  });
}

export function isValid(diagnostics) {
  return diagnostics.length === 0;
}

export function combineMessage(diagnostics) {
  return diagnostics.reduce((msg, d) => {
    msg += `${d.text}\n`;
    return msg;
  }, '');
}
