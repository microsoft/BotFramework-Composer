// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import get from 'lodash/get';
import { DialogInfo, ITrigger, SDKKinds } from '@bfc/shared';

import { triggerNotSupportedWarning } from '../constants';

export const resolveRecognizer$kind = (dialog: DialogInfo | undefined): SDKKinds | undefined => {
  if (!dialog) return undefined;

  const recognizer = get(dialog, 'content.recognizer');
  const $kind = get(recognizer, '$kind', undefined);

  if ($kind) return $kind;

  if (typeof recognizer === 'string') {
    return recognizer.endsWith('.lu.qna') ? SDKKinds.LuisRecognizer : undefined;
  }
  return;
};

export const isRegExRecognizerType = (dialog: DialogInfo | undefined) => {
  if (!dialog) return false;
  return get(dialog, 'content.recognizer.$kind', '') === SDKKinds.RegexRecognizer;
};

export const isPVARecognizerType = (dialog: DialogInfo | undefined) => {
  if (!dialog) return false;
  return get(dialog, 'content.recognizer.$kind', '') === 'Microsoft.VirtualAgents.Recognizer';
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
