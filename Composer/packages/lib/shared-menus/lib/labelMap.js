var _a;
import formatMessage from 'format-message';
import { SDKTypes } from './appschema';
formatMessage.setup({
  missingTranslation: 'ignore',
});
/**
 * These labels will be used when rendering the EdgeMenu
 * TODO: this is currently a copy of the SDKOverrides content from editor.schema. This should be drilled in from the shell.
 */
export var ConceptLabels = ((_a = {
  Activity: {
    description: formatMessage(
      'What your Bot says to the user. Visit <a target="_blank" href="https://github.com/Microsoft/BotBuilder-Samples/tree/master/experimental/language-generation"> the documentation</a> a reference of capabilities.'
    ),
    title: formatMessage('Language Generation'),
  },
}),
(_a[SDKTypes.AdaptiveDialog] = {
  title: formatMessage('AdaptiveDialog'),
}),
(_a[SDKTypes.AttachmentInput] = {
  title: formatMessage('Prompt for Attachment'),
}),
(_a[SDKTypes.BeginDialog] = {
  title: formatMessage('Begin a Dialog'),
}),
(_a[SDKTypes.CancelAllDialogs] = {
  title: formatMessage('Cancel All Dialogs'),
}),
(_a[SDKTypes.ChoiceInput] = {
  title: formatMessage('Prompt with multi-choice'),
}),
(_a[SDKTypes.ConditionalSelector] = {
  title: formatMessage('ConditionalSelector'),
}),
(_a[SDKTypes.ConfirmInput] = {
  title: formatMessage('Prompt for confirmation'),
}),
(_a[SDKTypes.DateTimeInput] = {
  title: formatMessage('Prompt for a date'),
}),
(_a[SDKTypes.DebugBreak] = {
  title: formatMessage('Debug Break'),
}),
(_a[SDKTypes.DeleteProperty] = {
  title: formatMessage('Delete a Property'),
}),
(_a[SDKTypes.EditActions] = {
  title: formatMessage('Modify active dialog'),
}),
(_a[SDKTypes.EditArray] = {
  title: formatMessage('Edit an Array Property'),
}),
(_a[SDKTypes.EmitEvent] = {
  title: formatMessage('Emit a custom event'),
}),
(_a[SDKTypes.EndDialog] = {
  title: formatMessage('End Dialog'),
}),
(_a[SDKTypes.EndTurn] = {
  title: formatMessage('End Turn'),
}),
(_a[SDKTypes.FirstSelector] = {
  title: formatMessage('FirstSelector'),
}),
(_a[SDKTypes.Foreach] = {
  title: formatMessage('Loop: For Each'),
}),
(_a[SDKTypes.ForeachPage] = {
  title: formatMessage('Loop: For Each Page'),
}),
(_a[SDKTypes.HttpRequest] = {
  title: formatMessage('HTTP Request'),
}),
(_a[SDKTypes.IfCondition] = {
  title: formatMessage('Branch: If/Else'),
}),
(_a[SDKTypes.InitProperty] = {
  title: formatMessage('Initialize a Property'),
}),
(_a[SDKTypes.LanguagePolicy] = {
  title: formatMessage('LanguagePolicy'),
}),
(_a[SDKTypes.LogAction] = {
  title: formatMessage('Log to console'),
}),
(_a[SDKTypes.LuisRecognizer] = {
  description: formatMessage(
    "To understand what the user says, your dialog needs a 'Recognizer', that includes example words and sentences that users may use."
  ),
  title: formatMessage('Language Understanding'),
}),
(_a[SDKTypes.MostSpecificSelector] = {
  title: formatMessage('MostSpecificSelector'),
}),
(_a[SDKTypes.MultiLanguageRecognizer] = {
  description: formatMessage(
    "To understand what the user says, your dialog needs a 'Recognizer', that includes example words and sentences that users may use."
  ),
  title: formatMessage('Language Understanding'),
}),
(_a[SDKTypes.NumberInput] = {
  title: formatMessage('Prompt for a number'),
}),
(_a[SDKTypes.OAuthInput] = {
  title: formatMessage('OAuth Login'),
}),
(_a[SDKTypes.OnActivity] = {
  title: formatMessage('Handle an Event: Activity'),
}),
(_a[SDKTypes.OnBeginDialog] = {
  title: formatMessage('Handle an Event: BeginDialog'),
}),
(_a[SDKTypes.OnConversationUpdateActivity] = {
  title: formatMessage('Handle ConversationUpdate'),
  description:
    'Handle the events fired when a user begins a new conversation with the bot. <a href="https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-conversations?view=azure-bot-service-4.0#conversation-lifetime" target="_blank">Learn more</a>',
}),
(_a[SDKTypes.OnDialogEvent] = {
  title: formatMessage('Handle a Dialog Event'),
}),
(_a[SDKTypes.OnEndOfConversationActivity] = {
  title: formatMessage('Handle an Event: EndOfConversationActivity'),
}),
(_a[SDKTypes.OnEvent] = {
  title: formatMessage('Handle an Event'),
}),
(_a[SDKTypes.OnEventActivity] = {
  title: formatMessage('Handle an Event: EventActivity'),
}),
(_a[SDKTypes.OnHandoffActivity] = {
  title: formatMessage('Handle an Event: HandoffActivity'),
}),
(_a[SDKTypes.OnIntent] = {
  title: formatMessage('Handle an Intent'),
}),
(_a[SDKTypes.OnInvokeActivity] = {
  title: formatMessage('Handle an Event: InvokeActivity'),
}),
(_a[SDKTypes.OnMessageActivity] = {
  title: formatMessage('Handle an Event: MessageActivity'),
}),
(_a[SDKTypes.OnMessageDeleteActivity] = {
  title: formatMessage('Handle an Event: MessageDeleteActivity'),
}),
(_a[SDKTypes.OnMessageReactionActivity] = {
  title: formatMessage('Handle an Event: MessageReactionActivity'),
}),
(_a[SDKTypes.OnMessageUpdateActivity] = {
  title: formatMessage('Handle an Event: MessageUpdateActivity'),
}),
(_a[SDKTypes.OnTypingActivity] = {
  title: formatMessage('Handle an Event: TypingActivity'),
}),
(_a[SDKTypes.OnUnknownIntent] = {
  title: formatMessage('Handle Unknown Intent'),
}),
(_a[SDKTypes.QnAMakerDialog] = {
  title: formatMessage('QnAMakerDialog'),
}),
(_a[SDKTypes.RandomSelector] = {
  title: formatMessage('RandomSelector'),
}),
(_a[SDKTypes.RegexRecognizer] = {
  description: false,
  title: false,
}),
(_a[SDKTypes.RepeatDialog] = {
  title: formatMessage('Repeat this Dialog'),
}),
(_a[SDKTypes.ReplaceDialog] = {
  title: formatMessage('Replace this Dialog'),
}),
(_a[SDKTypes.SendActivity] = {
  title: formatMessage('Send an Activity'),
}),
(_a[SDKTypes.SetProperty] = {
  title: formatMessage('Set a Property'),
}),
(_a[SDKTypes.SwitchCondition] = {
  title: formatMessage('Branch: Switch'),
}),
(_a[SDKTypes.TextInput] = {
  title: formatMessage('Prompt for text'),
}),
(_a[SDKTypes.TraceActivity] = {
  title: formatMessage('Emit a trace event'),
}),
(_a[SDKTypes.TrueSelector] = {
  title: formatMessage('TrueSelector'),
}),
_a);
//# sourceMappingURL=labelMap.js.map
