// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { SDKTypes } from './types';

formatMessage.setup({
  missingTranslation: 'ignore',
});

interface LabelOverride {
  title?: string | false;
  subtitle?: string | false;
  description?: string | false;
}

type ConceptLabelKey = SDKTypes | 'Activity';

/**
 * These labels will be used when rendering the EdgeMenu
 * TODO: this is currently a copy of the SDKOverrides content from editor.schema. This should be drilled in from the shell.
 */
export const ConceptLabels: { [key in ConceptLabelKey]?: LabelOverride } = {
  Activity: {
    description: formatMessage(
      'What your Bot says to the user. Visit <a target="_blank" href="https://github.com/Microsoft/BotBuilder-Samples/tree/master/experimental/language-generation"> the documentation</a> a reference of capabilities.'
    ),
    title: formatMessage('Language Generation'),
  },
  [SDKTypes.AdaptiveDialog]: {
    title: formatMessage('AdaptiveDialog'),
  },
  [SDKTypes.AttachmentInput]: {
    title: formatMessage('File or attachment'),
  },
  [SDKTypes.BeginDialog]: {
    title: formatMessage('Begin a new dialog'),
  },
  [SDKTypes.CancelAllDialogs]: {
    title: formatMessage('Cancel all dialogs'),
  },
  [SDKTypes.ChoiceInput]: {
    title: formatMessage('Multiple choice'),
  },
  [SDKTypes.ConditionalSelector]: {
    title: formatMessage('ConditionalSelector'),
  },
  [SDKTypes.ConfirmInput]: {
    title: formatMessage('Confirmation'),
  },
  [SDKTypes.DateTimeInput]: {
    title: formatMessage('Date or time'),
  },
  [SDKTypes.DebugBreak]: {
    title: formatMessage('Debug Break'),
  },
  [SDKTypes.DeleteProperty]: {
    title: formatMessage('Delete a property'),
  },
  [SDKTypes.EditActions]: {
    title: formatMessage('Modify this dialog'),
  },
  [SDKTypes.EditArray]: {
    title: formatMessage('Edit an Array property'),
  },
  [SDKTypes.EmitEvent]: {
    title: formatMessage('Emit a custom event'),
  },
  [SDKTypes.EndDialog]: {
    title: formatMessage('End this dialog'),
  },
  [SDKTypes.EndTurn]: {
    title: formatMessage('End dialog turn'),
  },
  [SDKTypes.FirstSelector]: {
    title: formatMessage('FirstSelector'),
  },
  [SDKTypes.Foreach]: {
    title: formatMessage('Loop: for each item'),
  },
  [SDKTypes.ForeachPage]: {
    title: formatMessage('Loop: for each page (multiple items)'),
  },
  [SDKTypes.HttpRequest]: {
    title: formatMessage('Send an HTTP request'),
  },
  [SDKTypes.IfCondition]: {
    title: formatMessage('Branch: if/else'),
  },
  [SDKTypes.InitProperty]: {
    title: formatMessage('Initialize a property'),
  },
  [SDKTypes.LanguagePolicy]: {
    title: formatMessage('LanguagePolicy'),
  },
  [SDKTypes.LogAction]: {
    title: formatMessage('Log to console'),
  },
  [SDKTypes.LuisRecognizer]: {
    description: formatMessage(
      "To understand what the user says, your dialog needs a 'Recognizer', that includes example words and sentences that users may use."
    ),
    title: formatMessage('Language Understanding'),
  },
  [SDKTypes.MostSpecificSelector]: {
    title: formatMessage('MostSpecificSelector'),
  },
  [SDKTypes.MultiLanguageRecognizer]: {
    description: formatMessage(
      "To understand what the user says, your dialog needs a 'Recognizer', that includes example words and sentences that users may use."
    ),
    title: formatMessage('Language Understanding'),
  },
  [SDKTypes.NumberInput]: {
    title: formatMessage('Number input'),
  },
  [SDKTypes.OAuthInput]: {
    title: formatMessage('OAuth login'),
  },
  [SDKTypes.OnActivity]: {
    title: formatMessage('Activity trigger'),
  },
  [SDKTypes.OnBeginDialog]: {
    title: formatMessage('Dialog started (BeginDialog)'),
  },
  [SDKTypes.OnCancelDialog]: {
    title: formatMessage('Dialog cancelled (CancelDialog)'),
  },
  [SDKTypes.OnCondition]: {
    title: formatMessage('Handle a Condition'),
  },
  [SDKTypes.OnConversationUpdateActivity]: {
    title: formatMessage('Conversation started (ConversationUpdate)'),
    description:
      'Handle the events fired when a user begins a new conversation with the bot. <a href="https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-conversations?view=azure-bot-service-4.0#conversation-lifetime" target="_blank">Learn more</a>',
  },
  [SDKTypes.OnCustomEvent]: {
    title: formatMessage('Custom trigger'),
  },
  [SDKTypes.OnDialogEvent]: {
    title: formatMessage('Dialog trigger'),
  },
  [SDKTypes.OnEndOfConversationActivity]: {
    title: formatMessage('Conversation ended'),
  },
  [SDKTypes.OnError]: {
    title: formatMessage('Error occurred'),
  },
  [SDKTypes.OnEventActivity]: {
    title: formatMessage('Event received'),
  },
  [SDKTypes.OnHandoffActivity]: {
    title: formatMessage('Handover to human'),
  },
  [SDKTypes.OnIntent]: {
    title: formatMessage('Intent'),
  },
  [SDKTypes.OnInvokeActivity]: {
    title: formatMessage('Conversation invoked'),
  },
  [SDKTypes.OnMessageActivity]: {
    title: formatMessage('Message activity trigger'),
  },
  [SDKTypes.OnMessageDeleteActivity]: {
    title: formatMessage('Message deleted'),
  },
  [SDKTypes.OnMessageReactionActivity]: {
    title: formatMessage('Message reaction'),
    subtitle: formatMessage('Message reaction (thumbs up/down)'),
  },
  [SDKTypes.OnMessageUpdateActivity]: {
    title: formatMessage('Message updated'),
  },
  [SDKTypes.OnRepromptDialog]: {
    title: formatMessage('Re-prompt for input'),
  },
  [SDKTypes.OnTypingActivity]: {
    title: formatMessage('User is typing'),
  },
  [SDKTypes.OnUnknownIntent]: {
    title: formatMessage('Unrecognized intent'),
  },
  [SDKTypes.QnAMakerDialog]: {
    title: formatMessage('Connect to QnA Knowledgebase'),
  },
  [SDKTypes.RandomSelector]: {
    title: formatMessage('RandomSelector'),
  },
  [SDKTypes.RegexRecognizer]: {
    description: false,
    title: false,
  },
  [SDKTypes.RepeatDialog]: {
    title: formatMessage('Repeat this dialog'),
  },
  [SDKTypes.ReplaceDialog]: {
    title: formatMessage('Replace this dialog'),
  },
  [SDKTypes.SendActivity]: {
    title: formatMessage('Send a response'),
  },
  [SDKTypes.SetProperty]: {
    title: formatMessage('Set a property'),
  },
  [SDKTypes.SwitchCondition]: {
    title: formatMessage('Branch: switch (multiple options)'),
  },
  [SDKTypes.TextInput]: {
    title: formatMessage('Text input'),
  },
  [SDKTypes.TraceActivity]: {
    title: formatMessage('Emit a trace event'),
  },
  [SDKTypes.TrueSelector]: {
    title: formatMessage('TrueSelector'),
  },
};
