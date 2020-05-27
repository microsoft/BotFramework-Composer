// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiTypes } from '../../constants/ObiTypes';

export function normalizeObiStep(data) {
  let step = data;
  // Grammar sugar provide by OBI runtime.
  if (typeof data === 'string') {
    step = {
      $kind: ObiTypes.BeginDialog,
      dialog: step,
    };
  }
  return step;
}
