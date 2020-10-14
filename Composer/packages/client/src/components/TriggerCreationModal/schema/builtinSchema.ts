// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

import { TriggerUIOptionMap } from './TriggerOption';

export const builtinTriggerUISchema: TriggerUIOptionMap = {
  [SDKKinds.OnIntent]: {
    label: 'Intent recognized',
  },
  [SDKKinds.OnQnAMatch]: {
    label: 'QnA Intent recognized',
  },
  [SDKKinds.OnUnknownIntent]: {
    label: 'Unknown intent',
  },
  [SDKKinds.OnChooseIntent]: {
    label: 'Duplicated intents recognized',
  },
  [SDKKinds.OnDialogEvent]: {
    label: 'Custom events',
  },
  // Subgroup - Dialog events
  [SDKKinds.OnBeginDialog]: {
    label: 'Dialog started (Begin dialog event)',
    submenu: {
      label: 'Dialog events',
      prompt: 'Which event?',
      placeholder: 'Select an event type',
    },
  },
  [SDKKinds.OnCancelDialog]: {
    label: 'Dialog cancelled (Cancel dialog event)',
    submenu: 'Dialog events',
  },
  [SDKKinds.OnBeginDialog]: {
    label: 'Dialog started (Begin dialog event)',
    submenu: 'Dialog events',
  },
  [SDKKinds.OnCancelDialog]: {
    label: 'Dialog cancelled (Cancel dialog event)',
    submenu: 'Dialog events',
  },
  [SDKKinds.OnError]: {
    label: 'Error occurred (Error event)',
    submenu: 'Dialog events',
  },
  [SDKKinds.OnRepromptDialog]: {
    label: 'Re-prompt for input (Reprompt dialog event)',
    submenu: 'Dialog events',
  },
  // Subgroup - Activities
  [SDKKinds.OnActivity]: {
    label: 'Activities (Activity received)',
    submenu: {
      label: 'Activities',
      prompt: 'Which activity type?',
      placeholder: 'Select an activity type',
    },
  },
  [SDKKinds.OnConversationUpdateActivity]: {
    label: 'Greeting (ConversationUpdate activity)',
    submenu: 'Activities',
  },
  [SDKKinds.OnEndOfConversationActivity]: {
    label: 'Conversation ended (EndOfConversation activity)',
    submenu: 'Activities',
  },
  [SDKKinds.OnEventActivity]: {
    label: 'Event received (Event activity)',
    submenu: 'Activities',
  },
  [SDKKinds.OnHandoffActivity]: {
    label: 'Handover to human (Handoff activity)',
    submenu: 'Activities',
  },
  [SDKKinds.OnInvokeActivity]: {
    label: 'Conversation invoked (Invoke activity)',
    submenu: 'Activities',
  },
  [SDKKinds.OnTypingActivity]: {
    label: 'User is typing (Typing activity)',
    submenu: 'Activities',
  },
  [SDKKinds.OnMessageActivity]: {
    label: 'Message received (Message received activity)',
    submenu: 'Activities',
  },
  [SDKKinds.OnMessageDeleteActivity]: {
    label: 'Message deleted (Message deleted activity)',
    submenu: 'Activities',
  },
  [SDKKinds.OnMessageReactionActivity]: {
    label: 'Message reaction (Message reaction activity)',
    submenu: 'Activities',
  },
  [SDKKinds.OnMessageUpdateActivity]: {
    label: 'Message updated (Message updated activity)',
    submenu: 'Activities',
  },
};
