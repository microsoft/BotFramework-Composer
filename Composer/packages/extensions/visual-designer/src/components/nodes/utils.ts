// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiTypes } from '../../constants/ObiTypes';

export function getUserAnswersTitle($kind: string): string {
  if (!$kind) return '';

  if ($kind === ObiTypes.ChoiceInput) {
    return 'ChoiceInput';
  }

  if ($kind.includes('Input')) {
    return `User Answers (${$kind.replace(/Microsoft.(.*)Input/, '$1')})`;
  }

  return '';
}
