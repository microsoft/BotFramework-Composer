// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';
import formatMessage from 'format-message';

import { RecognizerField, IntentField } from './components/fields';

const triggerUiSchema = {
  order: ['condition', '*'],
  hidden: ['actions'],
};

const DefaultUISchema: UISchema = {
  [SDKTypes.AdaptiveDialog]: {
    label: 'Adaptive dialog',
    description: () => formatMessage('This configures a data driven dialog via a collection of events and actions.'),
    helpLink: 'https://aka.ms/botframework',
    order: ['recognizer', '*'],
    hidden: ['triggers', 'autoEndDialog', 'generator', 'selector', 'schema'],
    properties: {
      recognizer: {
        label: () => formatMessage('Language Understanding'),
        description: () =>
          formatMessage(
            'To understand what the user says, your dialog needs a "Recognizer"; that includes example words and sentences that users may use.'
          ),
      },
    },
  },
  [SDKTypes.AttachmentInput]: {
    label: 'Prompt for Attachment',
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.BeginDialog]: {
    label: 'Begin a Dialog',
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'options', 'resultProperty', 'includeActivity', '*'],
  },
  [SDKTypes.OnCancelDialog]: {
    label: () => formatMessage('Dialog cancelled'),
    subtitle: () => formatMessage('Cancel dialog event'),
  },
  [SDKTypes.CancelAllDialogs]: {
    label: () => formatMessage('Cancel All Dialogs'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'property', '*'],
  },
  [SDKTypes.ChoiceInput]: {
    label: () => formatMessage('Prompt with multi-choice'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.ConfirmInput]: {
    label: () => formatMessage('Prompt for confirmation'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.DateTimeInput]: {
    label: () => formatMessage('Prompt for a date'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.DebugBreak]: { label: () => formatMessage('Debug Break') },
  [SDKTypes.DeleteProperties]: {
    label: () => formatMessage('Delete Properties'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.DeleteProperty]: {
    label: () => formatMessage('Delete a Property'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.DeleteProperties]: {
    label: () => formatMessage('Delete Properties'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.EditActions]: { label: () => formatMessage('Modify active dialog') },
  [SDKTypes.EditArray]: {
    label: () => formatMessage('Edit an Array Property'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.EmitEvent]: {
    label: () => formatMessage('Emit a custom event'),
    helpLink: 'https://aka.ms/bfc-custom-events',
  },
  [SDKTypes.EndDialog]: {
    label: () => formatMessage('End Dialog'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
  },
  [SDKTypes.EndTurn]: {
    label: () => formatMessage('End Turn'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
  },
  [SDKTypes.Foreach]: {
    label: () => formatMessage('Loop: For Each'),
    order: ['itemsProperty', '*'],
    hidden: ['actions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKTypes.ForeachPage]: {
    label: () => formatMessage('Loop: For Each Page'),
    order: ['itemsProperty', 'pageSize', '*'],
    hidden: ['actions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKTypes.HttpRequest]: {
    label: () => formatMessage('HTTP Request'),
    order: ['method', 'url', 'body', 'headers', '*'],
    helpLink: 'https://aka.ms/bfc-using-http',
  },
  [SDKTypes.IfCondition]: {
    label: () => formatMessage('Branch: If/Else'),
    hidden: ['actions', 'elseActions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKTypes.LogAction]: {
    label: () => formatMessage('Log to console'),
    helpLink: 'https://aka.ms/bfc-debugging-bots',
  },
  [SDKTypes.NumberInput]: {
    label: () => formatMessage('Prompt for a number'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.OAuthInput]: {
    label: () => formatMessage('OAuth Login'),
    helpLink: 'https://aka.ms/bfc-using-oauth',
    order: ['connectionName', '*'],
  },
  [SDKTypes.OnActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Activities'),
    subtitle: () => formatMessage('Activity recieved'),
  },
  [SDKTypes.OnBeginDialog]: {
    ...triggerUiSchema,
    label: () => formatMessage('Dialog started'),
    subtitle: () => formatMessage('Begin dialog event'),
  },
  [SDKTypes.OnCancelDialog]: { ...triggerUiSchema },
  [SDKTypes.OnCondition]: {
    ...triggerUiSchema,
    label: () => formatMessage('Handle a condition'),
    subtitle: () => formatMessage('Condition'),
  },
  [SDKTypes.OnConversationUpdateActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Greeting'),
    subtitle: () => formatMessage('ConversationUpdate activity'),
    description: () => formatMessage('Handle the events fired when a user begins a new conversation with the bot.'),
    helpLink:
      'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-conversations?view=azure-bot-service-4.0#conversation-lifetime',
  },
  [SDKTypes.OnCustomEvent]: {
    ...triggerUiSchema,
    label: () => formatMessage('Handle an Event'),
    subtitle: () => formatMessage('Custom event'),
  },
  [SDKTypes.OnDialogEvent]: {
    ...triggerUiSchema,
    label: () => formatMessage('Dialog events'),
    subtitle: () => formatMessage('Dialog event'),
  },
  [SDKTypes.OnEndOfConversationActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Conversation ended'),
    subtitle: () => formatMessage('EndOfConversation activity'),
  },
  [SDKTypes.OnError]: {
    ...triggerUiSchema,
    label: () => formatMessage('Error occurred'),
    subtitle: () => formatMessage('Error event'),
  },
  [SDKTypes.OnEventActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Event received'),
    subtitle: () => formatMessage('Event activity'),
  },
  [SDKTypes.OnHandoffActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Handover to human'),
    subtitle: () => formatMessage('Handoff activity'),
  },
  [SDKTypes.OnIntent]: {
    label: () => formatMessage('Intent recognized'),
    subtitle: () => formatMessage('Intent recognized'),
    order: ['intent', 'condition', 'entities', '*'],
    hidden: ['actions'],
    properties: {
      intent: {
        field: IntentField,
      },
    },
  },
  [SDKTypes.OnInvokeActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Conversation invoked'),
    subtitle: () => formatMessage('Invoke activity'),
  },
  [SDKTypes.OnMessageActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Message recieved'),
    subtitle: () => formatMessage('Message recieved activity'),
  },
  [SDKTypes.OnMessageDeleteActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Message deleted'),
    subtitle: () => formatMessage('Message deleted activity'),
  },
  [SDKTypes.OnMessageReactionActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Message reaction'),
    subtitle: () => formatMessage('Message reaction activity'),
  },
  [SDKTypes.OnMessageUpdateActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Message updated'),
    subtitle: () => formatMessage('Message updated activity'),
  },
  [SDKTypes.OnRepromptDialog]: {
    ...triggerUiSchema,
    label: () => formatMessage('Re-prompt for input'),
    subtitle: () => formatMessage('Reprompt dialog event'),
  },
  [SDKTypes.OnTypingActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('User is typing'),
    subtitle: () => formatMessage('Typing activity'),
  },
  [SDKTypes.OnUnknownIntent]: {
    ...triggerUiSchema,
    label: () => formatMessage('Unknown intent'),
    subtitle: () => formatMessage('Unknown intent recognized'),
  },
  [SDKTypes.QnAMakerDialog]: {
    label: () => formatMessage('QnAMakerDialog'),
    helpLink: 'https://aka.ms/bfc-using-QnA',
  },
  [SDKTypes.Recognizer]: {
    field: RecognizerField,
    helpLink: 'https://aka.ms/BFC-Using-LU',
  },
  [SDKTypes.RegexRecognizer]: {
    hidden: ['entities'],
  },
  [SDKTypes.RepeatDialog]: {
    label: () => formatMessage('Repeat this Dialog'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['options', 'includeActivity', '*'],
  },
  [SDKTypes.ReplaceDialog]: {
    label: () => formatMessage('Replace this Dialog'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'options', 'includeActivity', '*'],
  },
  [SDKTypes.SendActivity]: {
    label: () => formatMessage('Send an Activity'),
    helpLink: 'https://aka.ms/bfc-send-activity',
    order: ['activity', '*'],
  },
  [SDKTypes.SetProperty]: {
    label: () => formatMessage('Set a Property'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.SetProperties]: {
    label: () => formatMessage('Set Properties'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKTypes.SkillDialog]: {
    label: () => formatMessage('Call a remote skill'),
    helpLink: 'https://aka.ms/bfc-call-skill',
  },
  [SDKTypes.SwitchCondition]: {
    label: () => formatMessage('Branch: Switch'),
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
    hidden: ['default'],
    properties: { cases: { hidden: ['actions'] } },
  },
  [SDKTypes.TextInput]: {
    label: () => formatMessage('Prompt for text'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKTypes.TraceActivity]: {
    label: () => formatMessage('Emit a trace event'),
    helpLink: 'https://aka.ms/bfc-debugging-bots',
  },
};

export default DefaultUISchema;
