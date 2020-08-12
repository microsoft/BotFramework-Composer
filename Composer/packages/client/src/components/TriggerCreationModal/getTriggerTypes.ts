// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { MicrosoftIRecognizer, SDKKinds } from '@bfc/shared';

import { TriggerTypes } from './constants';

export function getTriggerTypes(recognizer?: MicrosoftIRecognizer): IDropdownOption[] {
  if (!recognizer) {
    return TriggerTypes.filter((t) => t.key !== SDKKinds.OnIntent);
  }
  return TriggerTypes;
}
