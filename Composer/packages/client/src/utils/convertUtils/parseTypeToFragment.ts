// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { dialogGroups, DialogGroup, PromptTab } from '@bfc/shared';

export function parseTypeToFragment(type: string, property: string): string {
  const inputTypes = dialogGroups[DialogGroup.INPUT].types;
  const index = inputTypes.findIndex((t) => t === type);
  if (index >= 0) {
    switch (property) {
      case 'prompt':
        return PromptTab.BOT_ASKS;
      case 'property':
      case 'choices':
      case 'outputFormat':
        return PromptTab.USER_INPUT;
      default:
        return PromptTab.OTHER;
    }
  }
  return '';
}
