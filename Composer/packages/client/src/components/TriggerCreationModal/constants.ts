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

export const ActivityTypes: IDropdownOption[] = [
  { key: 'Microsoft.OnActivity', text: 'Activities (Activity received)' },
  { key: 'Microsoft.OnConversationUpdateActivity', text: 'Greeting (ConversationUpdate activity)' },
  { key: 'Microsoft.OnEndOfConversationActivity', text: 'Conversation ended (EndOfConversation activity)' },
  { key: 'Microsoft.OnEventActivity', text: 'Event received (Event activity)' },
  { key: 'Microsoft.OnHandoffActivity', text: 'Handover to human (Handoff activity)' },
  { key: 'Microsoft.OnInvokeActivity', text: 'Conversation invoked (Invoke activity)' },
  { key: 'Microsoft.OnTypingActivity', text: 'User is typing (Typing activity)' },
  { key: 'Microsoft.OnMessageActivity', text: 'Message received (Message received activity)' },
  { key: 'Microsoft.OnMessageDeleteActivity', text: 'Message deleted (Message deleted activity)' },
  { key: 'Microsoft.OnMessageReactionActivity', text: 'Message reaction (Message reaction activity)' },
  { key: 'Microsoft.OnMessageUpdateActivity', text: 'Message updated (Message updated activity)' },
];

export const EventTypes: IDropdownOption[] = [
  { key: 'Microsoft.OnBeginDialog', text: 'Dialog started (Begin dialog event)' },
  { key: 'Microsoft.OnCancelDialog', text: 'Dialog cancelled (Cancel dialog event)' },
  { key: 'Microsoft.OnError', text: 'Error occurred (Error event)' },
  { key: 'Microsoft.OnRepromptDialog', text: 'Re-prompt for input (Reprompt dialog event)' },
];
