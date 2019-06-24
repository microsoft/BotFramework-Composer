import formatMessage from 'format-message';

/**
 * These labels will be used when rendering the EdgeMenu
 */
export const ConceptLabels = {
  // TODO: update label
  'Microsoft.AttachmentInput': 'Microsoft.AttachmentInput',
  'Microsoft.ChoiceInput': formatMessage('Type: Multiple Choice'),
  'Microsoft.ConfirmInput': formatMessage('Type: Yes/No Confirm'),
  'Microsoft.FloatInput': formatMessage('Type: Floating Point Number'),
  'Microsoft.IntegerInput': formatMessage('Type: Integer'),
  'Microsoft.NumberInput': formatMessage('Type: Any Number'),
  'Microsoft.TextInput': formatMessage('Type: Text'),
  'Microsoft.SendActivity': formatMessage('Send a single message'),
  'Microsoft.BeginDialog': formatMessage('Begin a child dialog'),
  'Microsoft.IfCondition': formatMessage('Branch: If/Else'),
  'Microsoft.SwitchCondition': formatMessage('Branch: Multi-path Switch'),
  // TODO: update label
  'Microsoft.Foreach': 'Microsoft.Foreach',
  // TODO: update label
  'Microsoft.ForeachPage': 'Microsoft.ForeachPage',

  'Microsoft.EndDialog': formatMessage('End this dialog (and resume parent)'),
  'Microsoft.CancelAllDialogs': formatMessage('End all active dialogs'),
  // TODO: update label
  'Microsoft.EditSteps': 'Microsoft.EditSteps',
  'Microsoft.EndTurn': formatMessage('End this turn'),
  'Microsoft.RepeatDialog': formatMessage('Restart this dialog'),
  'Microsoft.ReplaceDialog': formatMessage('Start a new dialog (and do not resume)'),
  'Microsoft.EmitEvent': formatMessage('Emit an event'),

  'Microsoft.SetProperty': formatMessage('Set a value'),
  'Microsoft.InitProperty': formatMessage('Create a new property'),
  'Microsoft.DeleteProperty': formatMessage('Delete a property'),
  'Microsoft.EditArray': formatMessage('Edit an array property'),

  'Microsoft.CodeStep': formatMessage('Run custom code'),
  'Microsoft.HttpRequest': formatMessage('Make an HTTP request'),
  // TODO: update label
  'Microsoft.OAuthInput': 'Microsoft.OAuthInput',

  // TODO: update label
  'Microsoft.DebugBreak': 'Microsoft.DebugBreak',
  'Microsoft.LogStep': formatMessage('Log a message to the console'),
  'Microsoft.TraceActivity': formatMessage('Emit a trace event'),

  'Microsoft.EventRule': formatMessage('Handle an event'),
  'Microsoft.IntentRule': formatMessage('Handle an intent'),
  'Microsoft.UnknownIntentRule': formatMessage('Provide a fallback handler'),
};
