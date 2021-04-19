// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema, FallbackRecognizerKey, ShellApi, ShellData } from '@bfc/extension-client';
import { checkForPVASchema } from '@bfc/shared';

import { recognizerOrderMap } from './defaultRecognizerOrder';
import { mapRecognizerSchemaToDropdownOption } from './mappers';

const getRankScore = (r: RecognizerSchema, shellData: ShellData, shellApi: ShellApi) => {
  // Always put disabled recognizer behind. Handle 'disabled' before 'default'.
  if ((typeof r.disabled === 'function' && r.disabled(shellData, shellApi)) || r.disabled) return Number.MAX_VALUE;
  // Always put default recognzier ahead.
  if (r.default) return -1;
  // Put fallback recognizer behind.
  if (r.id === FallbackRecognizerKey) return Number.MAX_VALUE - 1;
  return recognizerOrderMap[r.id] ?? Number.MAX_VALUE - 1;
};

export const getDropdownOptions = (configs: RecognizerSchema[], shellData: ShellData, shellApi: ShellApi) => {
  const isPVASchema = checkForPVASchema(shellData.schemas.sdk);
  let recognizerConfigs: RecognizerSchema[] = configs;
  if (isPVASchema) {
    recognizerConfigs = recognizerConfigs.filter((config) => {
      return config.id !== FallbackRecognizerKey;
    });
  }

  return recognizerConfigs
    .filter((r) => (typeof r.disabled === 'function' && !r.disabled(shellData, shellApi)) || !r.disabled)
    .sort((r1, r2) => {
      return getRankScore(r1, shellData, shellApi) - getRankScore(r2, shellData, shellApi);
    })
    .map(mapRecognizerSchemaToDropdownOption);
};
