// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiTypes } from '../../constants/ObiTypes';

export function getUserAnswersTitle($type: string): string {
  if (!$type) return '';

  if ($type === ObiTypes.ChoiceInput) {
    return 'ChoiceInput';
  }

  if ($type.includes('Input')) {
    return `User Answers (${$type.replace(/Microsoft.(.*)Input/, '$1')})`;
  }

  return '';
}
