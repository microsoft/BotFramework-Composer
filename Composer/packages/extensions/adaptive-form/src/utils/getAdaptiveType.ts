// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import get from 'lodash/get';

export function getAdaptiveType(data: any) {
  return get(data, '$type');
}
