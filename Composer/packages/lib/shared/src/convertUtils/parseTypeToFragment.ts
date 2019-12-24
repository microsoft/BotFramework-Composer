// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { dialogGroups, DialogGroup } from '../viewUtils';
import { PromptTab } from '../promptTabs';

export function parseTypeToFragment(type: string, property: string): string {
  const inputTypes = dialogGroups[DialogGroup.INPUT].types;
  const index = inputTypes.findIndex(t => t === type);
  if (index >= 0) {
    switch (property) {
      case 'prompt':
        return PromptTab.BOT_ASKS;
      case 'property':
      case 'outputFormat':
        return PromptTab.USER_INPUT;
      default:
        return PromptTab.OTHER;
    }
  }
  return '';
}
