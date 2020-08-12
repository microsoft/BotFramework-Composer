// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { TriggerTypes } from './constants';

export function getTriggerTypes(): IDropdownOption[] {
  return TriggerTypes;
}
