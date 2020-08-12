// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { luIndexer, combineMessage } from '@bfc/indexers';

import { nameRegex } from '../../constants';

import { TriggerFormData } from './types/TriggerFormData';
import { TriggerFormDataErrors } from './types/TriggerFormDataErrors';
import { eventTypeKey, customEventKey, intentTypeKey, activityTypeKey } from './constants';

export const getLuDiagnostics = (intent: string, triggerPhrases: string) => {
  const content = `#${intent}\n${triggerPhrases}`;
  const { diagnostics } = luIndexer.parse(content);
  return combineMessage(diagnostics);
};

export const validateTriggerKind = (selectedType: string): string | undefined => {
  if (!selectedType) {
    return formatMessage('Please select a trigger type');
  }
  return undefined;
};

export const validateEventKind = ($kind: string): string | undefined => {
  if (!$kind) {
    return formatMessage('Please select a event type');
  }
  return undefined;
};

export const validateActivityKind = ($kind: string): string | undefined => {
  if (!$kind) {
    return formatMessage('Please select an activity type');
  }
  return undefined;
};

export const validateEventName = ($kind: string, eventName: string): string | undefined => {
  if ($kind === eventTypeKey && !eventName) {
    return formatMessage('Please enter an event name');
  }
  return undefined;
};

export const validateIntentName = (intent: string): string | undefined => {
  if (!intent || !nameRegex.test(intent)) {
    return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  }
  return undefined;
};

export const validateRegExPattern = (regEx: string): string | undefined => {
  if (!regEx) {
    return formatMessage('Please input regEx pattern');
  }
  return undefined;
};

export const validateDupRegExIntent = (
  intent: string,
  regExIntents: [{ intent: string; pattern: string }]
): string | undefined => {
  if (regExIntents.find((ri) => ri.intent === intent)) {
    return formatMessage(`RegEx {intent} is already defined`, { intent });
  }
  return undefined;
};

export const validateTriggerPhrases = (intent: string, triggerPhrases: string): string | undefined => {
  if (triggerPhrases) {
    return getLuDiagnostics(intent, triggerPhrases);
  } else {
    return formatMessage('Please input trigger phrases');
  }
};

export const validateForm = (
  selectedType: string,
  data: TriggerFormData,
  isRegEx: boolean,
  regExIntents: [{ intent: string; pattern: string }]
): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $kind, event: eventName, intent, regEx, triggerPhrases } = data;

  errors.$kind = validateTriggerKind(selectedType);

  switch (selectedType) {
    case eventTypeKey:
      errors.event = validateEventKind($kind);
      break;
    case activityTypeKey:
      errors.activity = validateActivityKind($kind);
      break;
    case customEventKey:
      errors.customEventName = validateEventName($kind, eventName);
      break;
    case intentTypeKey:
      errors.intent = validateIntentName(intent);
      if (isRegEx) {
        errors.regEx = validateDupRegExIntent(intent, regExIntents) ?? validateRegExPattern(regEx);
      } else {
        errors.triggerPhrases = validateTriggerPhrases(intent, triggerPhrases);
      }
      break;
  }

  return errors;
};
