// Copyright (c) Microsoft Corporation.

import { LuisConfig, QnaConfig } from '../constants';

import { getReferredLuFiles } from './luUtil';
import { getReferredQnaFiles } from './qnaUtil';

// Licensed under the MIT License.
export function isConfigComplete(config, dialogs, luFiles, qnaFiles) {
  let complete = true;
  if (getReferredLuFiles(luFiles, dialogs).length > 0) {
    if (Object.values(LuisConfig).some((luisConfigKey) => config.luis[luisConfigKey] === '')) {
      complete = false;
    }
  }
  if (getReferredQnaFiles(qnaFiles, dialogs).length > 0) {
    if (Object.values(QnaConfig).some((qnaConfigKey) => config.qna[qnaConfigKey] === '')) {
      complete = false;
    }
  }
  return complete;
}

// return true if dialogs have one with default recognizer.
export function needsPublish(dialogs) {
  let isDefaultRecognizer = false;
  if (dialogs.some((dialog) => typeof dialog.content.recognizer === 'string')) {
    isDefaultRecognizer = true;
  }
  return isDefaultRecognizer;
}
