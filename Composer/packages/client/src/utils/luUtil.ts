// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * luUtil.ts is a single place use lu-parser handle lu file operation.
 * it's designed have no state, input text file, output text file.
 * for more usage detail, please check client/__tests__/utils/luUtil.test.ts
 */
import { createSingleMessage, BotIndexer } from '@bfc/indexers';
import { LuFile, DialogInfo, DiagnosticSeverity, SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

import { getBaseName } from './fileUtil';

export * from '@bfc/indexers/lib/utils/luUtil';

/*
 * checkoutContent: will check out the file content by default
 */
export function getReferredLuFiles(luFiles: LuFile[], dialogs: DialogInfo[], checkContent = true) {
  return luFiles.filter((file) => {
    const idWithoutLocale = getBaseName(file.id);
    const contentNotEmpty = (checkContent && !!file.content) || !checkContent;
    return dialogs.some((dialog) => dialog.luFile === idWithoutLocale && contentNotEmpty);
  });
}

export function getLuisBuildLuFiles(luFiles: LuFile[], dialogs: DialogInfo[]) {
  return luFiles.filter((file) => {
    const idWithoutLocale = getBaseName(file.id);
    return dialogs.some(
      (dialog) =>
        dialog.luFile === idWithoutLocale && dialog.luProvider !== SDKKinds.OrchestratorRecognizer && !file.empty
    );
  });
}

function generateErrorMessage(invalidLuFile: LuFile[]) {
  return invalidLuFile
    .map((file) => {
      const fileErrorText = `In ${file.id}.lu: ` + file.diagnostics.map(createSingleMessage).join('\n ');
      return `\n ${fileErrorText} \n`;
    })
    .join();
}

export function checkLuisBuild(luFiles: LuFile[], dialogs: DialogInfo[]) {
  const referred = getReferredLuFiles(luFiles, dialogs, false);
  const invalidLuFile = referred.filter(
    (file) => file.diagnostics.filter((n) => n.severity === DiagnosticSeverity.Error).length !== 0
  );
  if (invalidLuFile.length !== 0) {
    const msg = generateErrorMessage(invalidLuFile);
    throw new Error(formatMessage(`The Following LuFile(s) are invalid: \n`) + msg);
  }
  // supported LUIS locale.
  const supported = BotIndexer.filterLUISFilesToPublish(referred, dialogs);
  return supported;
}
