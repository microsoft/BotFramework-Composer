// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import keys from 'lodash/keys';

import { dialogGroups, DialogGroup } from '../viewUtils';
import { PromptTab } from '../promptTabs';

export function parseTypeToFragment(type: string, property: string): string {
  if (keys(dialogGroups[DialogGroup.INPUT].types).indexOf(type) >= 0) {
    if (property === 'property') return PromptTab.USER_INPUT;
    if (property === 'prompt') return PromptTab.BOT_ASKS;
    return PromptTab.OTHER;
  }
  return '';
}
