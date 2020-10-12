// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { RecognizerType, SDKKinds } from '@bfc/shared';

/**
 * fix dialog's lg/lu referrence, use dialog's lg/lu file
 */
export function autofixReferInDialog(dialogId: string, content: string): string {
  try {
    const dialogJson = JSON.parse(content);

    // fix lg referrence
    dialogJson.generator = `${dialogId}.lg`;

    // fix lu referrence
    if (typeof dialogJson.recognizer === 'string') {
      dialogJson.recognizer = `${dialogId}.lu.qna`;
    }
    return JSON.stringify(dialogJson, null, 2);
  } catch (_error) {
    // pass, content may be empty
    return content;
  }
}

export function getRecognizerType(recognizer): RecognizerType {
  if (typeof recognizer === 'string') {
    return 'DefaultRecognizer';
  }

  if (recognizer?.$kind && recognizer.$kind === SDKKinds.RegexRecognizer) {
    return 'RegexRecognizer';
  }

  return 'CustomRecognizer';
}
