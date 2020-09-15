// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema } from '@bfc/extension-client';

import { recognizerOrderMap } from './defaultRecognizerOrder';

const getRankScore = (r: RecognizerSchema) => {
  if (r.default) return 0;
  if (r.disabled) return Number.MAX_VALUE;
  return recognizerOrderMap[r.id] ?? Number.MAX_VALUE - 1;
};

export const getDropdownOptions = (recognizerConfigs: RecognizerSchema[]) => {
  return recognizerConfigs
    .filter((r) => !r.disabled)
    .sort((r1, r2) => {
      return getRankScore(r1) - getRankScore(r2);
    })
    .map((r) => ({
      key: r.id,
      text: typeof r.displayName === 'function' ? r.displayName({}) : r.displayName,
    }));
};
