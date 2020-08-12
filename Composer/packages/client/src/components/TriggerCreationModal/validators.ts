// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { luIndexer, combineMessage } from '@bfc/indexers';

import { TriggerFormData, TriggerFormDataErrors } from '../../utils/dialogUtil';
import { nameRegex } from '../../constants';

import { eventTypeKey, customEventKey, intentTypeKey, activityTypeKey } from './constants';

export const getLuDiagnostics = (intent: string, triggerPhrases: string) => {
  const content = `#${intent}\n${triggerPhrases}`;
  const { diagnostics } = luIndexer.parse(content);
  return combineMessage(diagnostics);
};

const validateDupRegExIntent = (
  selectedType: string,
  intent: string,
  isRegEx: boolean,
  regExIntents: [{ intent: string; pattern: string }]
): string | undefined => {
  if (selectedType === intentTypeKey && isRegEx && regExIntents.find((ri) => ri.intent === intent)) {
    return formatMessage(`RegEx {intent} is already defined`, { intent });
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
  if (selectedType === intentTypeKey && !isRegEx) {
    if (triggerPhrases) {
      return getLuDiagnostics(intent, triggerPhrases);
    } else {
      return formatMessage('Please input trigger phrases');
    }
  }
  return undefined;
};

export const validateIntentName = (selectedType: string, intent: string): string | undefined => {
  if (selectedType === intentTypeKey && (!intent || !nameRegex.test(intent))) {
    return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  }
  return undefined;
};

export const validateRegExPattern = (selectedType: string, isRegEx: boolean, regEx: string): string | undefined => {
  if (selectedType === intentTypeKey && isRegEx && !regEx) {
    return formatMessage('Please input regEx pattern');
  }
  return undefined;
};

export const validateEventName = (selectedType: string, $kind: string, eventName: string): string | undefined => {
  if (selectedType === customEventKey && $kind === eventTypeKey && !eventName) {
    return formatMessage('Please enter an event name');
  }
  return undefined;
};

export const validateEventKind = (selectedType: string, $kind: string): string | undefined => {
  if (selectedType === eventTypeKey && !$kind) {
    return formatMessage('Please select a event type');
  }

  if (selectedType === activityTypeKey && !$kind) {
    return formatMessage('Please select an activity type');
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

  errors.event = validateEventName(selectedType, $kind, eventName) ?? validateEventKind(selectedType, $kind);
  errors.$kind = validateTriggerKind(selectedType);
  errors.intent = validateIntentName(selectedType, intent);
  errors.regEx =
    validateDupRegExIntent(selectedType, intent, isRegEx, regExIntents) ??
    validateRegExPattern(selectedType, isRegEx, regEx);
  errors.triggerPhrases = validateTriggerPhrases(selectedType, isRegEx, intent, triggerPhrases);
  return errors;
};
