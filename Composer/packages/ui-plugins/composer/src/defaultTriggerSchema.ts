// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TriggerUISchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

export const DefaultTriggerSchema: TriggerUISchema = {
  [SDKKinds.OnIntent]: {
    label: formatMessage('Intent recognized'),
    order: 1,
  },
  [SDKKinds.OnQnAMatch]: {
    label: formatMessage('QnA Intent recognized'),
    order: 2,
  },
  [SDKKinds.OnUnknownIntent]: {
    label: formatMessage('Unknown intent'),
    order: 3,
  },
  [SDKKinds.OnChooseIntent]: {
    label: formatMessage('Duplicated intents recognized'),
    order: 6,
  },
  [SDKKinds.OnDialogEvent]: {
    label: formatMessage('Custom events'),
    order: 7,
  },
  // Subgroup - Dialog events
  [SDKKinds.OnBeginDialog]: {
    label: formatMessage('Dialog started (Begin dialog event)'),
    order: 4.1,
    submenu: {
      label: formatMessage('Dialog events'),
      prompt: formatMessage('Which event?'),
      placeholder: formatMessage('Select an event type'),
    },
  },
  [SDKKinds.OnCancelDialog]: {
    label: formatMessage('Dialog cancelled (Cancel dialog event)'),
    order: 4.2,
    submenu: formatMessage('Dialog events'),
  },
  [SDKKinds.OnError]: {
    label: formatMessage('Error occurred (Error event)'),
    order: 4.3,
    submenu: formatMessage('Dialog events'),
  },
  [SDKKinds.OnRepromptDialog]: {
    label: formatMessage('Re-prompt for input (Reprompt dialog event)'),
    order: 4.4,
    submenu: formatMessage('Dialog events'),
  },
  // Subgroup - Activities
  [SDKKinds.OnActivity]: {
    label: formatMessage('Activities (Activity received)'),
    order: 5.1,
    submenu: {
      label: formatMessage('Activities'),
      prompt: formatMessage('Which activity type?'),
      placeholder: formatMessage('Select an activity type'),
    },
  },
  [SDKKinds.OnConversationUpdateActivity]: {
    label: formatMessage('Greeting (ConversationUpdate activity)'),
    order: 5.2,
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnEndOfConversationActivity]: {
    label: formatMessage('Conversation ended (EndOfConversation activity)'),
    order: 5.3,
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnEventActivity]: {
    label: formatMessage('Event received (Event activity)'),
    order: 5.4,
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnHandoffActivity]: {
    label: formatMessage('Handover to human (Handoff activity)'),
    order: 5.5,
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnInvokeActivity]: {
    label: formatMessage('Conversation invoked (Invoke activity)'),
    order: 5.6,
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnTypingActivity]: {
    label: formatMessage('User is typing (Typing activity)'),
    order: 5.7,
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnMessageActivity]: {
    label: formatMessage('Message received (Message received activity)'),
    order: 5.81,
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnMessageDeleteActivity]: {
    label: formatMessage('Message deleted (Message deleted activity)'),
    order: 5.82,
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnMessageReactionActivity]: {
    label: formatMessage('Message reaction (Message reaction activity)'),
    order: 5.83,
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnMessageUpdateActivity]: {
    label: formatMessage('Message updated (Message updated activity)'),
    order: 5.84,
    submenu: formatMessage('Activities'),
  },
};
