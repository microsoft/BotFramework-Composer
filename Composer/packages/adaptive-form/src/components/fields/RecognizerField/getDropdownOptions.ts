// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema, FallbackRecognizerKey } from '@bfc/extension-client';

import { recognizerOrderMap } from './defaultRecognizerOrder';
import { mapRecognizerSchemaToDropdownOption } from './mappers';

const getRankScore = (r: RecognizerSchema) => {
  // Always put disabled recognizer behind. Handle 'disabled' before 'default'.
  if (r.disabled) return Number.MAX_VALUE;
  // Always put default recognzier ahead.
  if (r.default) return -1;
  // Put fallback recognizer behind.
  if (r.id === FallbackRecognizerKey) return Number.MAX_VALUE - 1;
  return recognizerOrderMap[r.id] ?? Number.MAX_VALUE - 1;
};

export const getDropdownOptions = (recognizerConfigs: RecognizerSchema[]) => {
  return recognizerConfigs
    .filter((r) => !r.disabled)
    .sort((r1, r2) => {
      return getRankScore(r1) - getRankScore(r2);
    })
    .map(mapRecognizerSchemaToDropdownOption);
};
