// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TriggerUISchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

export const DefaultTriggerSchema: TriggerUISchema = {
  [SDKKinds.OnIntent]: {
    label: formatMessage('Intent recognized'),
  },
  [SDKKinds.OnQnAMatch]: {
    label: formatMessage('QnA Intent recognized'),
  },
  [SDKKinds.OnUnknownIntent]: {
    label: formatMessage('Unknown intent'),
  },
  [SDKKinds.OnChooseIntent]: {
    label: formatMessage('Duplicated intents recognized'),
  },
  [SDKKinds.OnDialogEvent]: {
    label: formatMessage('Custom events'),
  },
  // Subgroup - Dialog events
  [SDKKinds.OnBeginDialog]: {
    label: formatMessage('Dialog started (Begin dialog event)'),
    submenu: {
      label: formatMessage('Dialog events'),
      prompt: formatMessage('Which event?'),
      placeholder: formatMessage('Select an event type'),
    },
  },
  [SDKKinds.OnCancelDialog]: {
    label: formatMessage('Dialog cancelled (Cancel dialog event)'),
    submenu: formatMessage('Dialog events'),
  },
  [SDKKinds.OnError]: {
    label: formatMessage('Error occurred (Error event)'),
    submenu: formatMessage('Dialog events'),
  },
  [SDKKinds.OnRepromptDialog]: {
    label: formatMessage('Re-prompt for input (Reprompt dialog event)'),
    submenu: formatMessage('Dialog events'),
  },
  // Subgroup - Activities
  [SDKKinds.OnActivity]: {
    label: formatMessage('Activities (Activity received)'),
    submenu: {
      label: formatMessage('Activities'),
      prompt: formatMessage('Which activity type?'),
      placeholder: formatMessage('Select an activity type'),
    },
  },
  [SDKKinds.OnConversationUpdateActivity]: {
    label: formatMessage('Greeting (ConversationUpdate activity)'),
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnEndOfConversationActivity]: {
    label: formatMessage('Conversation ended (EndOfConversation activity)'),
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnEventActivity]: {
    label: formatMessage('Event received (Event activity)'),
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnHandoffActivity]: {
    label: formatMessage('Handover to human (Handoff activity)'),
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnInvokeActivity]: {
    label: formatMessage('Conversation invoked (Invoke activity)'),
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnTypingActivity]: {
    label: formatMessage('User is typing (Typing activity)'),
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnMessageActivity]: {
    label: formatMessage('Message received (Message received activity)'),
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnMessageDeleteActivity]: {
    label: formatMessage('Message deleted (Message deleted activity)'),
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnMessageReactionActivity]: {
    label: formatMessage('Message reaction (Message reaction activity)'),
    submenu: formatMessage('Activities'),
  },
  [SDKKinds.OnMessageUpdateActivity]: {
    label: formatMessage('Message updated (Message updated activity)'),
    submenu: formatMessage('Activities'),
  },
};
