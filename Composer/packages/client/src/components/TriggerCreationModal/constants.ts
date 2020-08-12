// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

export const eventTypeKey = 'DialogEvents';
export const intentTypeKey = 'IntentRecognized';
export const activityTypeKey = 'Activities';
export const customEventKey = 'CustomEvents';

export const TriggerTypes: IDropdownOption[] = [
  { key: 'Microsoft.OnIntent', text: formatMessage('Intent recognized') },
  { key: 'Microsoft.OnUnknownIntent', text: formatMessage('Unknown intent') },
  { key: 'Microsoft.OnDialogEvent', text: formatMessage('Dialog events') },
  { key: 'Microsoft.OnActivity', text: formatMessage('Activities') },
  { key: 'OnCustomEvent', text: formatMessage('Custom events') },
];
