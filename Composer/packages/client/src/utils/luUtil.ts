// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * luUtil.ts is a single place use lu-parser handle lu file operation.
 * it's designed have no state, input text file, output text file.
 * for more usage detail, please check client/__tests__/utils/luUtil.test.ts
 */

import { LuFile, DialogInfo } from '@bfc/shared';

import { getBaseName } from './fileUtil';
export * from '@bfc/indexers/lib/utils/luUtil';

export function getReferredFiles(luFiles: LuFile[], dialogs: DialogInfo[]) {
  return luFiles.filter(file => {
    const idWithOutLocale = getBaseName(file.id);
    if (dialogs.findIndex(dialog => dialog.luFile === idWithOutLocale) !== -1) {
      return true;
    }
    return false;
  });
}
