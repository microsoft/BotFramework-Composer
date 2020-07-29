// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * luUtil.ts is a single place use lu-parser handle lu file operation.
 * it's designed have no state, input text file, output text file.
 * for more usage detail, please check client/__tests__/utils/luUtil.test.ts
 */
import { QnAFile, DialogInfo } from '@bfc/shared';

import { getBaseName, getExtension } from './fileUtil';
export * from '@bfc/indexers/lib/utils/qnaUtil';

export function getFileLocale(fileName: string) {
  //file name = 'a.en-us.qna'
  return getExtension(getBaseName(fileName));
}
export function getReferredQnaFiles(qnaFiles: QnAFile[], dialogs: DialogInfo[]) {
  return qnaFiles.filter((file) => {
    const idWithOutLocale = getBaseName(file.id);
    return dialogs.some((dialog) => dialog.qnaFile === idWithOutLocale && !!file.content);
  });
}
