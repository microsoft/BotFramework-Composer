// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

export const defaultRecognizerOrder = [SDKKinds.CrossTrainedRecognizerSet, SDKKinds.RegexRecognizer];

export const recognizerOrderMap: { [$kind: string]: number } = defaultRecognizerOrder.reduce((result, $kind, index) => {
  result[$kind] = index;
  return result;
}, {});
