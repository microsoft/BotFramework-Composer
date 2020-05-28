// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveKinds } from '../../constants/AdaptiveKinds';

export function normalizeObiStep(data) {
  let step = data;
  // Grammar sugar provide by OBI runtime.
  if (typeof data === 'string') {
    step = {
      $kind: AdaptiveKinds.BeginDialog,
      dialog: step,
    };
  }
  return step;
}
