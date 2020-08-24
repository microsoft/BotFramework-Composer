// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { SDKKinds } from './types';

formatMessage.setup({
  missingTranslation: 'ignore',
});

interface LabelOverride {
  title?: string | false;
  subtitle?: string | false;
  description?: string | false;
}

type ConceptLabelKey = SDKKinds | 'Activity';

/**
 * These labels will be used when rendering the EdgeMenu
 * TODO: this is currently a copy of the SDKOverrides content from editor.schema. This should be drilled in from the shell.
 */
export const ConceptLabels: { [key in ConceptLabelKey]?: LabelOverride } = {
  Activity: {
    description: formatMessage(
      'What your Bot says to the user. Visit <a target="_blank" href="https://aka.ms/bf-composer-docs-lg"> the documentation</a> a reference of capabilities.'
    ),
    title: formatMessage('Language Generation'),
  },
  [SDKKinds.AdaptiveDialog]: {
    title: formatMessage('Adaptive dialog'),
  },
  [SDKKinds.AttachmentInput]: {
    title: formatMessage('File or attachment'),
  },
  [SDKKinds.BeginDialog]: {
    title: formatMessage('Begin a new dialog'),
  },
  [SDKKinds.CancelAllDialogs]: {
    title: formatMessage('Cancel all active dialogs'),
  },
  [SDKKinds.ChoiceInput]: {
    title: formatMessage('Multi-choice'),
  },
  [SDKKinds.ConditionalSelector]: {
    title: formatMessage('ConditionalSelector'),
  },
  [SDKKinds.ConfirmInput]: {
    title: formatMessage('Confirmation'),
  },
  [SDKKinds.DateTimeInput]: {
    title: formatMessage('Date or time'),
  },
  [SDKKinds.DebugBreak]: {
    title: formatMessage('Debug break'),
  },
  [SDKKinds.DeleteProperty]: {
    title: formatMessage('Delete a property'),
  },
  [SDKKinds.DeleteProperties]: {
    title: formatMessage('Delete properties'),
  },
  [SDKKinds.EditActions]: {
    title: formatMessage('Modify this dialog'),
  },
  [SDKKinds.EditArray]: {
    title: formatMessage('Edit an array property'),
  },
  [SDKKinds.EmitEvent]: {
    title: formatMessage('Emit a custom event'),
  },
  [SDKKinds.EndDialog]: {
    title: formatMessage('End this dialog'),
  },
  [SDKKinds.EndTurn]: {
    title: formatMessage('End turn'),
  },
  [SDKKinds.FirstSelector]: {
    title: formatMessage('FirstSelector'),
  },
  [SDKKinds.Foreach]: {
    title: formatMessage('Loop: For each item'),
  },
  [SDKKinds.ForeachPage]: {
    title: formatMessage('Loop: For each page (multiple items)'),
  },
  [SDKKinds.ContinueLoop]: {
    title: formatMessage('Continue loop'),
  },
  [SDKKinds.BreakLoop]: {
    title: formatMessage('Break out of loop'),
  },
  [SDKKinds.HttpRequest]: {
    title: formatMessage('Send an HTTP request'),
  },
  [SDKKinds.IfCondition]: {
    title: formatMessage('Branch: If/else'),
  },
  [SDKKinds.LanguagePolicy]: {
    title: formatMessage('LanguagePolicy'),
  },
  [SDKKinds.LogAction]: {
    title: formatMessage('Log to console'),
  },
  [SDKKinds.LuisRecognizer]: {
    description: formatMessage(
      "To understand what the user says, your dialog needs a 'IRecognizer', that includes example words and sentences that users may use."
    ),
    title: formatMessage('Language Understanding'),
  },
  [SDKKinds.MostSpecificSelector]: {
    title: formatMessage('MostSpecificSelector'),
  },
  [SDKKinds.MultiLanguageRecognizer]: {
    description: formatMessage(
      "To understand what the user says, your dialog needs a 'IRecognizer', that includes example words and sentences that users may use."
    ),
    title: formatMessage('Language Understanding'),
  },
  [SDKKinds.NumberInput]: {
    title: formatMessage('Number'),
  },
  [SDKKinds.OAuthInput]: {
    title: formatMessage('OAuth login'),
  },
  [SDKKinds.OnActivity]: {
    title: formatMessage('Activities'),
    subtitle: formatMessage('Activity received'),
  },
  [SDKKinds.OnBeginDialog]: {
    title: formatMessage('Dialog started'),
    subtitle: formatMessage('Begin dialog event'),
  },
  [SDKKinds.OnCancelDialog]: {
    title: formatMessage('Dialog cancelled'),
    subtitle: formatMessage('Cancel dialog event'),
  },
  [SDKKinds.OnCondition]: {
    title: formatMessage('Handle a Condition'),
  },
  [SDKKinds.OnConversationUpdateActivity]: {
    title: formatMessage('Greeting'),
    subtitle: formatMessage('ConversationUpdate activity'),
    description:
      'Handle the events fired when a user begins a new conversation with the bot. <a href="https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-conversations?view=azure-bot-service-4.0#conversation-lifetime" target="_blank">Learn more</a>',
  },
  [SDKKinds.OnDialogEvent]: {
    title: formatMessage('Dialog events'),
    subtitle: formatMessage('Dialog events'),
  },
  [SDKKinds.OnEndOfConversationActivity]: {
    title: formatMessage('Conversation ended'),
    subtitle: formatMessage('EndOfConversation activity'),
  },
  [SDKKinds.OnError]: {
    title: formatMessage('Error occurred'),
    subtitle: formatMessage('Error event'),
  },
  [SDKKinds.OnEventActivity]: {
    title: formatMessage('Event received'),
    subtitle: formatMessage('Event activity'),
  },
  [SDKKinds.OnHandoffActivity]: {
    title: formatMessage('Handover to human'),
    subtitle: formatMessage('Handoff activity'),
  },
  [SDKKinds.OnIntent]: {
    title: formatMessage('Intent recognized'),
    subtitle: formatMessage('Intent recognized'),
  },
  [SDKKinds.OnInvokeActivity]: {
    title: formatMessage('Conversation invoked'),
    subtitle: formatMessage('Invoke activity'),
  },
  [SDKKinds.OnMessageActivity]: {
    title: formatMessage('Message received'),
    subtitle: formatMessage('Message received activity'),
  },
  [SDKKinds.OnMessageDeleteActivity]: {
    title: formatMessage('Message deleted'),
    subtitle: formatMessage('Message deleted activity'),
  },
  [SDKKinds.OnMessageReactionActivity]: {
    title: formatMessage('Message reaction'),
    subtitle: formatMessage('Message reaction activity'),
  },
  [SDKKinds.OnMessageUpdateActivity]: {
    title: formatMessage('Message updated'),
    subtitle: formatMessage('Message updated activity'),
  },
  [SDKKinds.UpdateActivity]: {
    title: formatMessage('Update activity'),
    subtitle: formatMessage('Update a an activity previously sent during the conversation'),
  },
  [SDKKinds.DeleteActivity]: {
    title: formatMessage('Delete activity'),
  },
  [SDKKinds.OnMessageUpdateActivity]: {
    title: formatMessage('Message updated'),
    subtitle: formatMessage('Message updated activity'),
  },
  [SDKKinds.OnRepromptDialog]: {
    title: formatMessage('Re-prompt for input'),
    subtitle: formatMessage('Reprompt dialog event'),
  },
  [SDKKinds.OnTypingActivity]: {
    title: formatMessage('User is typing'),
    subtitle: formatMessage('Typing activity'),
  },
  [SDKKinds.OnUnknownIntent]: {
    title: formatMessage('Unknown intent'),
    subtitle: formatMessage('Unknown intent recognized'),
  },
  [SDKKinds.QnAMakerDialog]: {
    title: formatMessage('Connect to QnA Knowledgebase'),
  },
  [SDKKinds.RandomSelector]: {
    title: formatMessage('RandomSelector'),
  },
  [SDKKinds.RegexRecognizer]: {
    description: false,
    title: false,
  },
  [SDKKinds.RepeatDialog]: {
    title: formatMessage('Repeat this dialog'),
  },
  [SDKKinds.ReplaceDialog]: {
    title: formatMessage('Replace this dialog'),
  },
  [SDKKinds.SendActivity]: {
    title: formatMessage('Send a response'),
  },
  [SDKKinds.SetProperty]: {
    title: formatMessage('Set a property'),
  },
  [SDKKinds.SetProperties]: {
    title: formatMessage('Set properties'),
  },
  [SDKKinds.SignOutUser]: {
    title: formatMessage('Sign out user'),
  },
  [SDKKinds.BeginSkill]: {
    title: formatMessage('Connect to a skill'),
    description: formatMessage('Begin a remote skill dialog.'),
  },
  [SDKKinds.SwitchCondition]: {
    title: formatMessage('Branch: Switch (multiple options)'),
  },
  [SDKKinds.TextInput]: {
    title: formatMessage('Text'),
  },
  [SDKKinds.TraceActivity]: {
    title: formatMessage('Emit a trace event'),
  },
  [SDKKinds.TrueSelector]: {
    title: formatMessage('TrueSelector'),
  },
};
