export const DialogGroup = {
  RESPONSE: 'RESPONSE',
  INPUT: 'INPUT',
  BRANCHING: 'BRANCHING',
  MEMORY: 'MEMORY',
  STEP: 'STEP',
  CODE: 'CODE',
  LOG: 'LOG',
  RULE: 'RULE',
  RECOGNIZER: 'RECOGNIZER',
  SELECTOR: 'SELECTOR',
  OTHER: 'OTHER',
};

/**
 * These labels will be used when rendering the EdgeMenu
 * EXPERIMENTAL: Added by Ben Brown on 5/31 because I don't know how to do this the right way.
 * TODO: Use the appropriate mechanism to re-label items
 */
export const DialogGroupLabels = {
  'Microsoft.ChoiceInput': 'Type: Multiple Choice',
  'Microsoft.ConfirmInput': 'Type: Yes/No Confirm',
  'Microsoft.FloatInput': 'Type: Floating Point Number',
  'Microsoft.IntegerInput': 'Type: Integer',
  'Microsoft.NumberInput': 'Type: Any Number',
  'Microsoft.TextInput': 'Type: Text',
  'Microsoft.SendActivity': 'Send a single message',
  'Microsoft.BeginDialog': 'Begin a child dialog',
  'Microsoft.IfCondition': 'Branch: If/Else',
  'Microsoft.SwitchCondition': 'Branch: Multi-path Switch',

  'Microsoft.EndDialog': 'End this dialog (and resume parent)',
  'Microsoft.CancelAllDialogs': 'End all active dialogs',
  'Microsoft.EndTurn': 'End this turn',
  'Microsoft.RepeatDialog': 'Restart this dialog',
  'Microsoft.ReplaceDialog': 'Start a new dialog (and do not resume)',
  'Microsoft.EmitEvent': 'Emit an event',

  'Microsoft.SetProperty': 'Set a value',
  'Microsoft.SaveEntity': 'Convert LU entity to a property',
  'Microsoft.InitProperty': 'Create a new property',
  'Microsoft.DeleteProperty': 'Delete a property',
  'Microsoft.EditArray': 'Edit an array property',

  'Microsoft.CodeStep': 'Run custom code',
  'Microsoft.HttpRequest': 'Make an HTTP request',

  'Microsoft.LogStep': 'Log a message to the console',
  'Microsoft.TraceActivity': 'Emit a trace event',
};

export const dialogGroups = {
  [DialogGroup.RESPONSE]: {
    label: 'Send Messages',
    types: ['Microsoft.SendActivity', 'Microsoft.BeginDialog'],
  },
  [DialogGroup.INPUT]: {
    label: 'Ask a Question',
    types: [
      'Microsoft.TextInput',
      'Microsoft.NumberInput',
      'Microsoft.IntegerInput',
      'Microsoft.FloatInput',
      'Microsoft.ConfirmInput',
      'Microsoft.ChoiceInput',
    ],
  },
  [DialogGroup.BRANCHING]: {
    label: 'Decisions',
    types: ['Microsoft.IfCondition', 'Microsoft.SwitchCondition'],
  },
  [DialogGroup.MEMORY]: {
    label: 'Memory manipulation',
    types: [
      'Microsoft.SetProperty',
      'Microsoft.SaveEntity',
      'Microsoft.InitProperty',
      'Microsoft.DeleteProperty',
      'Microsoft.EditArray',
    ],
  },
  [DialogGroup.STEP]: {
    label: 'Flow',
    types: [
      'Microsoft.IfCondition',
      'Microsoft.SwitchCondition',
      'Microsoft.BeginDialog',
      'Microsoft.EndDialog',
      'Microsoft.CancelAllDialogs',
      'Microsoft.EndTurn',
      'Microsoft.RepeatDialog',
      'Microsoft.ReplaceDialog',
      'Microsoft.EmitEvent',
    ],
  },
  [DialogGroup.CODE]: {
    label: 'Roll your own code',
    types: ['Microsoft.HttpRequest', 'Microsoft.CodeStep'],
  },
  [DialogGroup.LOG]: {
    label: 'Debugging',
    types: ['Microsoft.LogStep', 'Microsoft.TraceActivity'],
  },
  [DialogGroup.RULE]: {
    label: 'Rules',
    types: ['Microsoft.EventRule', 'Microsoft.IntentRule', 'Microsoft.UnknownIntentRule'],
  },
  [DialogGroup.RECOGNIZER]: {
    label: 'Recognizers',
    types: ['Microsoft.LuisRecognizer', /* 'Microsoft.MultiLanguageRecognizers', */ 'Microsoft.RegexRecognizer'],
  },
  [DialogGroup.SELECTOR]: {
    label: 'Selectors',
    types: [
      'Microsoft.ConditionalSelector',
      'Microsoft.FirstSelector',
      'Microsoft.MostSpecificSelector',
      'Microsoft.RandomSelector',
      'Microsoft.TrueSelector',
    ],
  },
  [DialogGroup.OTHER]: {
    label: 'Other',
    types: ['Microsoft.AdaptiveDialog', 'Microsoft.LanguagePolicy', 'Microsoft.QnAMakerDialog'],
  },
};
