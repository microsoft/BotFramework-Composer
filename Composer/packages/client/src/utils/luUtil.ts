// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuFile, DialogInfo } from '@bfc/indexers';

export function getReferredFiles(luFiles: LuFile[], dialogs: DialogInfo[]) {
  return luFiles.filter(file => {
    if (dialogs.findIndex(dialog => dialog.luFile === file.id) !== -1) {
      return true;
    }
    return false;
  });
}
