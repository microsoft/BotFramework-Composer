import formatMessage from 'format-message';

import { SDKTypes } from './appschema';

formatMessage.setup({
  missingTranslation: 'ignore',
});

interface LabelOverride {
  title?: string | false;
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
    title: formatMessage('Prompt for Attachment'),
  },
  [SDKTypes.BeginDialog]: {
    title: formatMessage('Begin a Dialog'),
  },
  [SDKTypes.CancelAllDialogs]: {
    title: formatMessage('Cancel All Dialogs'),
  },
  [SDKTypes.ChoiceInput]: {
    title: formatMessage('Prompt with multi-choice'),
  },
  [SDKTypes.ConditionalSelector]: {
    title: formatMessage('ConditionalSelector'),
  },
  [SDKTypes.ConfirmInput]: {
    title: formatMessage('Prompt for confirmation'),
  },
  [SDKTypes.DateTimeInput]: {
    title: formatMessage('Prompt for a date'),
  },
  [SDKTypes.DebugBreak]: {
    title: formatMessage('Debug Break'),
  },
  [SDKTypes.DeleteProperty]: {
    title: formatMessage('Delete a Property'),
  },
  [SDKTypes.EditActions]: {
    title: formatMessage('Modify active dialog'),
  },
  [SDKTypes.EditArray]: {
    title: formatMessage('Edit an Array Property'),
  },
  [SDKTypes.EmitEvent]: {
    title: formatMessage('Emit a custom event'),
  },
  [SDKTypes.EndDialog]: {
    title: formatMessage('End Dialog'),
  },
  [SDKTypes.EndTurn]: {
    title: formatMessage('End Turn'),
  },
  [SDKTypes.FirstSelector]: {
    title: formatMessage('FirstSelector'),
  },
  [SDKTypes.Foreach]: {
    title: formatMessage('Loop: For Each'),
  },
  [SDKTypes.ForeachPage]: {
    title: formatMessage('Loop: For Each Page'),
  },
  [SDKTypes.HttpRequest]: {
    title: formatMessage('HTTP Request'),
  },
  [SDKTypes.IfCondition]: {
    title: formatMessage('Branch: If/Else'),
  },
  [SDKTypes.InitProperty]: {
    title: formatMessage('Initialize a Property'),
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
    title: formatMessage('Prompt for a number'),
  },
  [SDKTypes.OAuthInput]: {
    title: formatMessage('OAuth Login'),
  },
  [SDKTypes.OnActivity]: {
    title: formatMessage('Handle an Event: Activity'),
  },
  [SDKTypes.OnBeginDialog]: {
    title: formatMessage('Handle an Event: BeginDialog'),
  },
  [SDKTypes.OnConversationUpdateActivity]: {
    title: formatMessage('Handle ConversationUpdate'),
    description:
      'Handle the events fired when a user begins a new conversation with the bot. <a href="https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-conversations?view=azure-bot-service-4.0#conversation-lifetime" target="_blank">Learn more</a>',
  },
  [SDKTypes.OnDialogEvent]: {
    title: formatMessage('Handle a Dialog Event'),
  },
  [SDKTypes.OnEndOfConversationActivity]: {
    title: formatMessage('Handle an Event: EndOfConversationActivity'),
  },
  [SDKTypes.OnEvent]: {
    title: formatMessage('Handle an Event'),
  },
  [SDKTypes.OnEventActivity]: {
    title: formatMessage('Handle an Event: EventActivity'),
  },
  [SDKTypes.OnHandoffActivity]: {
    title: formatMessage('Handle an Event: HandoffActivity'),
  },
  [SDKTypes.OnIntent]: {
    title: formatMessage('Handle an Intent'),
  },
  [SDKTypes.OnInvokeActivity]: {
    title: formatMessage('Handle an Event: InvokeActivity'),
  },
  [SDKTypes.OnMessageActivity]: {
    title: formatMessage('Handle an Event: MessageActivity'),
  },
  [SDKTypes.OnMessageDeleteActivity]: {
    title: formatMessage('Handle an Event: MessageDeleteActivity'),
  },
  [SDKTypes.OnMessageReactionActivity]: {
    title: formatMessage('Handle an Event: MessageReactionActivity'),
  },
  [SDKTypes.OnMessageUpdateActivity]: {
    title: formatMessage('Handle an Event: MessageUpdateActivity'),
  },
  [SDKTypes.OnTypingActivity]: {
    title: formatMessage('Handle an Event: TypingActivity'),
  },
  [SDKTypes.OnUnknownIntent]: {
    title: formatMessage('Handle Unknown Intent'),
  },
  [SDKTypes.QnAMakerDialog]: {
    title: formatMessage('QnAMakerDialog'),
  },
  [SDKTypes.RandomSelector]: {
    title: formatMessage('RandomSelector'),
  },
  [SDKTypes.RegexRecognizer]: {
    description: false,
    title: false,
  },
  [SDKTypes.RepeatDialog]: {
    title: formatMessage('Repeat this Dialog'),
  },
  [SDKTypes.ReplaceDialog]: {
    title: formatMessage('Replace this Dialog'),
  },
  [SDKTypes.SendActivity]: {
    title: formatMessage('Send an Activity'),
  },
  [SDKTypes.SetProperty]: {
    title: formatMessage('Set a Property'),
  },
  [SDKTypes.SwitchCondition]: {
    title: formatMessage('Branch: Switch'),
  },
  [SDKTypes.TextInput]: {
    title: formatMessage('Prompt for text'),
  },
  [SDKTypes.TraceActivity]: {
    title: formatMessage('Emit a trace event'),
  },
  [SDKTypes.TrueSelector]: {
    title: formatMessage('TrueSelector'),
  },
};
