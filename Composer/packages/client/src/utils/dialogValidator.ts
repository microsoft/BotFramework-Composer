// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import get from 'lodash/get';
import { DialogInfo, ITrigger, SDKKinds } from '@bfc/shared';

import { triggerNotSupportedWarning } from '../constants';

export const isRegExRecognizerType = (dialog: DialogInfo | undefined) => {
  if (!dialog) return false;
  return get(dialog, 'content.recognizer.$kind', '') === SDKKinds.RegexRecognizer;
};

export const isLUISnQnARecognizerType = (dialog: DialogInfo | undefined) => {
  if (!dialog) return false;
  const recognizer = get(dialog, 'content.recognizer', '');
  return typeof recognizer === 'string' && recognizer.endsWith('.lu.qna');
};

export const containUnsupportedTriggers = (dialog: DialogInfo | undefined) => {
  if (!dialog) return '';

  if (
    isRegExRecognizerType(dialog) &&
    dialog.triggers.some((t) => t.type === SDKKinds.OnQnAMatch || t.type === SDKKinds.OnChooseIntent)
  ) {
    return triggerNotSupportedWarning;
  }
  return '';
};

export const triggerNotSupported = (dialog: DialogInfo | undefined, trigger: ITrigger | undefined) => {
  if (!dialog || !trigger) return '';
  if (
    isRegExRecognizerType(dialog) &&
    (trigger.type === SDKKinds.OnQnAMatch || trigger.type === SDKKinds.OnChooseIntent)
  ) {
    return triggerNotSupportedWarning;
  }
  return '';
};
