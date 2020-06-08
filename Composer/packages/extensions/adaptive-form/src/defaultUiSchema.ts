// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

import { IntentField, RecognizerField } from './components/fields';

const triggerUiSchema = {
  order: ['condition', '*'],
  hidden: ['actions'],
};

const DefaultUISchema: UISchema = {
  [SDKKinds.AdaptiveDialog]: {
    label: 'Adaptive dialog',
    description: () => formatMessage('This configures a data driven dialog via a collection of events and actions.'),
    helpLink: 'https://aka.ms/bf-composer-docs-dialog',
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
  [SDKKinds.AttachmentInput]: {
    label: 'Prompt for a file or an attachment',
    subtitle: () => formatMessage('Attachment Input'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.BeginDialog]: {
    label: 'Begin a new dialog',
    subtitle: () => formatMessage('Begin Dialog'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'options', 'resultProperty', 'includeActivity', '*'],
  },
  [SDKKinds.OnCancelDialog]: {
    label: () => formatMessage('Dialog cancelled'),
    subtitle: () => formatMessage('Cancel dialog event'),
  },
  [SDKKinds.CancelAllDialogs]: {
    label: () => formatMessage('Cancel all active dialogs'),
    subtitle: () => formatMessage('Cancel All Dialogs'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'property', '*'],
  },
  [SDKKinds.ChoiceInput]: {
    label: () => formatMessage('Prompt with multi-choice'),
    subtitle: () => formatMessage('Choice Input'),

    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.ConfirmInput]: {
    label: () => formatMessage('Prompt for confirmation'),
    subtitle: () => formatMessage('Confirm Input'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.DateTimeInput]: {
    label: () => formatMessage('Prompt for a date or a time'),
    subtitle: () => formatMessage('Date Time Input'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.DebugBreak]: { label: () => formatMessage('Debug Break') },
  [SDKKinds.DeleteProperties]: {
    label: () => formatMessage('Delete properties'),
    subtitle: () => formatMessage('Delete Properties'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKKinds.DeleteProperty]: {
    label: () => formatMessage('Delete a property'),
    subtitle: () => formatMessage('Delete Property'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  // [SDKKinds.DeleteProperties]: {
  //   label: () => formatMessage('Delete Properties'),
  //   helpLink: 'https://aka.ms/bfc-using-memory',
  // },
  [SDKKinds.EditActions]: {
    label: () => formatMessage('Modify active dialog'),
    subtitle: () => formatMessage('Edit Actions'),
  },
  [SDKKinds.EditArray]: {
    label: () => formatMessage('Edit an array property'),
    subtitle: () => formatMessage('Edit Array'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKKinds.EmitEvent]: {
    label: () => formatMessage('Emit a custom event'),
    subtitle: () => formatMessage('Emit Event'),
    helpLink: 'https://aka.ms/bfc-custom-events',
  },
  [SDKKinds.EndDialog]: {
    label: () => formatMessage('End this dialog'),
    subtitle: () => formatMessage('End Dialog'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
  },
  [SDKKinds.EndTurn]: {
    label: () => formatMessage('End dialog turn'),
    subtitle: () => formatMessage('End Turn'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
  },
  [SDKKinds.Foreach]: {
    label: () => formatMessage('Loop: For each item'),
    subtitle: () => formatMessage('For Each'),
    order: ['itemsProperty', '*'],
    hidden: ['actions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKKinds.ForeachPage]: {
    label: () => formatMessage('Loop: For each page (multiple items)'),
    subtitle: () => formatMessage('For Each Page'),
    order: ['itemsProperty', 'pageSize', '*'],
    hidden: ['actions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKKinds.ContinueLoop]: {
    label: () => formatMessage('Continue loop'),
    subtitle: () => formatMessage('Continue loop'),
  },
  [SDKKinds.BreakLoop]: {
    label: () => formatMessage('Break out of loop'),
    subtitle: () => formatMessage('Break out of loop'),
  },
  [SDKKinds.HttpRequest]: {
    label: () => formatMessage('Send an HTTP request'),
    subtitle: () => formatMessage('HTTP Request'),
    order: ['method', 'url', 'body', 'headers', '*'],
    helpLink: 'https://aka.ms/bfc-using-http',
  },
  [SDKKinds.IfCondition]: {
    label: () => formatMessage('Branch: If/Else'),
    subtitle: () => formatMessage('If Condition'),
    hidden: ['actions', 'elseActions'],
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
  },
  [SDKKinds.IRecognizer]: {
    field: RecognizerField,
    helpLink: 'https://aka.ms/BFC-Using-LU',
  },
  [SDKKinds.LogAction]: {
    label: () => formatMessage('Log to console'),
    subtitle: () => formatMessage('Log Action'),
    helpLink: 'https://aka.ms/bfc-debugging-bots',
  },
  [SDKKinds.NumberInput]: {
    label: () => formatMessage('Prompt for a number'),
    subtitle: () => formatMessage('Number Input'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.OAuthInput]: {
    label: () => formatMessage('OAuth login'),
    subtitle: () => formatMessage('OAuth Input'),
    helpLink: 'https://aka.ms/bfc-using-oauth',
    order: ['connectionName', '*'],
  },
  [SDKKinds.OnActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Activities'),
    subtitle: () => formatMessage('Activity received'),
  },
  [SDKKinds.OnBeginDialog]: {
    ...triggerUiSchema,
    label: () => formatMessage('Dialog started'),
    subtitle: () => formatMessage('Begin dialog event'),
  },
  [SDKKinds.OnCancelDialog]: { ...triggerUiSchema },
  [SDKKinds.OnCondition]: {
    ...triggerUiSchema,
    label: () => formatMessage('Handle a condition'),
    subtitle: () => formatMessage('Condition'),
  },
  [SDKKinds.OnConversationUpdateActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Greeting'),
    subtitle: () => formatMessage('ConversationUpdate activity'),
    description: () => formatMessage('Handle the events fired when a user begins a new conversation with the bot.'),
    helpLink: 'https://aka.ms/bf-composer-docs-conversation-update-activity',
  },
  [SDKKinds.OnDialogEvent]: {
    ...triggerUiSchema,
    label: () => formatMessage('Dialog events'),
    subtitle: () => formatMessage('Dialog event'),
  },
  [SDKKinds.OnEndOfConversationActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Conversation ended'),
    subtitle: () => formatMessage('EndOfConversation activity'),
  },
  [SDKKinds.OnError]: {
    ...triggerUiSchema,
    label: () => formatMessage('Error occurred'),
    subtitle: () => formatMessage('Error event'),
  },
  [SDKKinds.OnEventActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Event received'),
    subtitle: () => formatMessage('Event activity'),
  },
  [SDKKinds.OnHandoffActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Handover to human'),
    subtitle: () => formatMessage('Handoff activity'),
  },
  [SDKKinds.OnIntent]: {
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
  [SDKKinds.OnInvokeActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Conversation invoked'),
    subtitle: () => formatMessage('Invoke activity'),
  },
  [SDKKinds.OnMessageActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Message recieved'),
    subtitle: () => formatMessage('Message recieved activity'),
  },
  [SDKKinds.OnMessageDeleteActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Message deleted'),
    subtitle: () => formatMessage('Message deleted activity'),
  },
  [SDKKinds.OnMessageReactionActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Message reaction'),
    subtitle: () => formatMessage('Message reaction activity'),
  },
  [SDKKinds.OnMessageUpdateActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('Message updated'),
    subtitle: () => formatMessage('Message updated activity'),
  },
  [SDKKinds.OnRepromptDialog]: {
    ...triggerUiSchema,
    label: () => formatMessage('Re-prompt for input'),
    subtitle: () => formatMessage('Reprompt dialog event'),
  },
  [SDKKinds.OnTypingActivity]: {
    ...triggerUiSchema,
    label: () => formatMessage('User is typing'),
    subtitle: () => formatMessage('Typing activity'),
  },
  [SDKKinds.OnUnknownIntent]: {
    ...triggerUiSchema,
    label: () => formatMessage('Unknown intent'),
    subtitle: () => formatMessage('Unknown intent recognized'),
  },
  [SDKKinds.QnAMakerDialog]: {
    label: () => formatMessage('Connect to QnA Knowledgebase'),
    subtitle: () => formatMessage('QnA Maker Dialog'),
    helpLink: 'https://aka.ms/bfc-using-QnA',
  },
  [SDKKinds.RegexRecognizer]: {
    hidden: ['entities'],
  },
  [SDKKinds.RepeatDialog]: {
    label: () => formatMessage('Repeat this dialog'),
    subtitle: () => formatMessage('Repeat Dialog'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['options', 'includeActivity', '*'],
  },
  [SDKKinds.ReplaceDialog]: {
    label: () => formatMessage('Replace this dialog'),
    subtitle: () => formatMessage('Replace Dialog'),
    helpLink: 'https://aka.ms/bfc-understanding-dialogs',
    order: ['dialog', 'options', 'includeActivity', '*'],
  },
  [SDKKinds.SendActivity]: {
    label: () => formatMessage('Send a response'),

    subtitle: () => formatMessage('Send Activity'),
    helpLink: 'https://aka.ms/bfc-send-activity',
    order: ['activity', '*'],
  },
  [SDKKinds.SetProperty]: {
    label: () => formatMessage('Set a property'),
    subtitle: () => formatMessage('Set Property'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKKinds.SetProperties]: {
    label: () => formatMessage('Set properties'),
    subtitle: () => formatMessage('Set Properties'),
    helpLink: 'https://aka.ms/bfc-using-memory',
  },
  [SDKKinds.BeginSkill]: {
    label: () => formatMessage('Connect to a skill'),
    subtitle: () => formatMessage('Skill Dialog'),
    helpLink: 'https://aka.ms/bf-composer-docs-connect-skill',
  },
  [SDKKinds.SwitchCondition]: {
    label: () => formatMessage('Branch: Switch (multiple options)'),
    subtitle: () => formatMessage('Switch Condition'),
    helpLink: 'https://aka.ms/bfc-controlling-conversation-flow',
    hidden: ['default'],
    properties: { cases: { hidden: ['actions'] } },
  },
  [SDKKinds.TextInput]: {
    label: () => formatMessage('Prompt for text'),
    subtitle: () => formatMessage('Text Input'),
    helpLink: 'https://aka.ms/bfc-ask-for-user-input',
  },
  [SDKKinds.TraceActivity]: {
    label: () => formatMessage('Emit a trace event'),
    subtitle: () => formatMessage('Trace Activity'),
    helpLink: 'https://aka.ms/bfc-debugging-bots',
  },
};

export default DefaultUISchema;
