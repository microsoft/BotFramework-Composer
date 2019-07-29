import formatMessage from 'format-message';

formatMessage.setup({
  missingTranslation: 'ignore',
});

/**
 * These labels will be used when rendering the EdgeMenu
 * TODO: this is currently a copy of the SDKOverrides content from editor.schema. This should be drilled in from the shell.
 */
export const ConceptLabels = {
  'Microsoft.AdaptiveDialog': {
    title: formatMessage('AdaptiveDialog'),
  },
  'Microsoft.BeginDialog': {
    title: formatMessage('Begin a Dialog'),
  },
  'Microsoft.CancelAllDialogs': {
    title: formatMessage('Cancel All Dialogs'),
  },
  'Microsoft.ChoiceInput': {
    title: formatMessage('Prompt with multi-choice'),
  },
  'Microsoft.ConditionalSelector': {
    title: formatMessage('ConditionalSelector'),
  },
  'Microsoft.ConfirmInput': {
    title: formatMessage('Prompt for confirmation'),
  },
  'Microsoft.DateTimeInput': {
    title: formatMessage('Type: Date'),
  },
  'Microsoft.DebugBreak': {
    title: formatMessage('Debug Break'),
  },
  'Microsoft.DeleteProperty': {
    title: formatMessage('Delete a Property'),
  },
  'Microsoft.EditArray': {
    title: formatMessage('Edit an Array Property'),
  },
  'Microsoft.EmitEvent': {
    title: formatMessage('Emit a custom event'),
  },
  'Microsoft.EndDialog': {
    title: formatMessage('End Dialog'),
  },
  'Microsoft.EndTurn': {
    title: formatMessage('End Turn'),
  },
  'Microsoft.EventRule': {
    title: formatMessage('Handle an Event'),
  },
  'Microsoft.FirstSelector': {
    title: formatMessage('FirstSelector'),
  },
  'Microsoft.HttpRequest': {
    title: formatMessage('HTTP Request'),
  },
  'Microsoft.IfCondition': {
    title: formatMessage('Branch: If/Else'),
  },
  'Microsoft.InitProperty': {
    title: formatMessage('Initialize a Property'),
  },
  'Microsoft.IntentRule': {
    title: formatMessage('Handle an Intent'),
  },
  'Microsoft.LanguagePolicy': {
    title: formatMessage('LanguagePolicy'),
  },
  'Microsoft.LogStep': {
    title: formatMessage('Log to console'),
  },
  'Microsoft.LuisRecognizer': {
    title: formatMessage('Language Understanding'),
    description: formatMessage(
      "To understand what the user says, your dialog needs a 'Recognizer', that includes example words and sentences that users may use."
    ),
  },
  'Microsoft.MostSpecificSelector': {
    title: formatMessage('MostSpecificSelector'),
  },
  'Microsoft.MultiLanguageRecognizer': {
    title: formatMessage('Language Understanding'),
    description: formatMessage(
      "To understand what the user says, your dialog needs a 'Recognizer', that includes example words and sentences that users may use."
    ),
  },
  'Microsoft.NumberInput': {
    title: formatMessage('Prompt for a number'),
  },
  'Microsoft.QnAMakerDialog': {
    title: formatMessage('QnAMakerDialog'),
  },
  'Microsoft.RandomSelector': {
    title: formatMessage('RandomSelector'),
  },
  'Microsoft.RegexRecognizer': {
    title: false,
    description: false,
  },
  'Microsoft.RepeatDialog': {
    title: formatMessage('Repeat this Dialog'),
  },
  'Microsoft.ReplaceDialog': {
    title: formatMessage('Replace this Dialog'),
  },
  'Microsoft.Rule': {
    title: formatMessage('Rule'),
  },
  'Microsoft.SaveEntity': {
    title: formatMessage('Save an Entity'),
  },
  'Microsoft.SendActivity': {
    title: formatMessage('Send an Activity'),
  },
  'Microsoft.OAuthInput': {
    title: formatMessage('OAuth Login'),
  },
  'Microsoft.AttachmentInput': {
    title: formatMessage('Prompt for Attachment'),
  },
  Activity: {
    title: formatMessage('Language Generation'),
    description: formatMessage(
      'What your Bot says to the user. Visit <a target="_blank" href="https://github.com/Microsoft/BotBuilder-Samples/tree/master/experimental/language-generation"> the documentation</a> a reference of capabilities.'
    ),
  },
  'Microsoft.SetProperty': {
    title: formatMessage('Set a Property'),
  },
  'Microsoft.SwitchCondition': {
    title: formatMessage('Branch: Switch'),
  },
  'Microsoft.TextInput': {
    title: formatMessage('Prompt for text'),
  },
  'Microsoft.TraceActivity': {
    title: formatMessage('Emit a trace event'),
  },
  'Microsoft.TrueSelector': {
    title: formatMessage('TrueSelector'),
  },
  'Microsoft.UnknownIntentRule': {
    title: formatMessage('Handle Unknown Intent'),
  },
  'Microsoft.ConversationUpdateActivityRule': {
    title: formatMessage('Handle ConversationUpdate'),
  },
  'Microsoft.Foreach': {
    title: formatMessage('Loop: For Each'),
  },
  'Microsoft.ForeachPage': {
    title: formatMessage('Loop: For Each Page'),
  },
  'Microsoft.EditSteps': {
    title: formatMessage('Modify active dialog'),
  },
};
