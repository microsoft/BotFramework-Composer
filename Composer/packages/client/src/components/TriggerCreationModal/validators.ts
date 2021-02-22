// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { luIndexer, combineMessage } from '@bfc/indexers';
import { SDKKinds } from '@bfc/shared';

import { TriggerFormData, TriggerFormDataErrors } from '../../utils/dialogUtil';
import { nameRegex } from '../../constants';

export const getLuDiagnostics = (intent: string, triggerPhrases: string) => {
  const content = `#${intent}\n${triggerPhrases}`;
  const { diagnostics } = luIndexer.parse(content, '', {});
  return combineMessage(diagnostics);
};
export const validateIntentName = (selectedType: string, intent: string): string | undefined => {
  if (selectedType === SDKKinds.OnIntent && (!intent || !nameRegex.test(intent))) {
    return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  }
  return undefined;
};
const validateDupRegExIntent = (
  selectedType: string,
  intent: string,
  isRegEx: boolean,
  regExIntents: [{ intent: string; pattern: string }]
): string | undefined => {
  if (selectedType === SDKKinds.OnIntent && isRegEx && regExIntents.find((ri) => ri.intent === intent)) {
    return formatMessage(`RegEx {intent} is already defined`, { intent });
  }
  return undefined;
};
export const validateRegExPattern = (selectedType: string, isRegEx: boolean, regEx: string): string | undefined => {
  if (selectedType === SDKKinds.OnIntent && isRegEx && !regEx) {
    return formatMessage('Please input regEx pattern');
  }
  return undefined;
};
export const validateEventName = (selectedType: string, $kind: string, eventName: string): string | undefined => {
  if (selectedType === SDKKinds.OnDialogEvent && !eventName) {
    return formatMessage('Please enter an event name');
  }
  return undefined;
};
const validateTriggerKind = (selectedType: string): string | undefined => {
  if (!selectedType) {
    return formatMessage('Please select a trigger type');
  }
  return undefined;
};

const validateTriggerPhrases = (
  selectedType: string,
  isRegEx: boolean,
  intent: string,
  triggerPhrases: string
): string | undefined => {
  if (selectedType === SDKKinds.OnIntent && !isRegEx && triggerPhrases) {
    return getLuDiagnostics(intent, triggerPhrases);
  }
  return undefined;
};
export const validateForm = (
  selectedType: string,
  data: TriggerFormData,
  isRegEx: boolean,
  regExIntents: [{ intent: string; pattern: string }]
): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $kind, event: eventName, intent, regEx, triggerPhrases } = data;

  errors.event = validateEventName(selectedType, $kind, eventName);
  errors.$kind = validateTriggerKind(selectedType);
  errors.intent = validateIntentName(selectedType, intent);
  errors.regEx =
    validateDupRegExIntent(selectedType, intent, isRegEx, regExIntents) ??
    validateRegExPattern(selectedType, isRegEx, regEx);
  errors.triggerPhrases = validateTriggerPhrases(selectedType, isRegEx, intent, triggerPhrases);
  return errors;
};
