export const DialogGroup = {
  INPUT: 'INPUT',
  RESPONSE: 'RESPONSE',
  MEMORY: 'MEMORY',
  STEP: 'STEP',
  CODE: 'CODE',
  LOG: 'LOG',
  RULE: 'RULE',
  RECOGNIZER: 'RECOGNIZER',
  SELECTOR: 'SELECTOR',
  OTHER: 'OTHER',
};

export const dialogGroups = {
  [DialogGroup.INPUT]: {
    label: 'Input/Prompt Dialogs',
    types: [
      'Microsoft.ChoiceInput',
      'Microsoft.ConfirmInput',
      'Microsoft.FloatInput',
      'Microsoft.IntegerInput',
      'Microsoft.NumberInput',
      'Microsoft.TextInput',
    ],
  },
  [DialogGroup.RESPONSE]: {
    label: 'Sending a response',
    types: ['Microsoft.SendActivity'],
  },
  [DialogGroup.MEMORY]: {
    label: 'Memory manipulation',
    types: [
      'Microsoft.DeleteProperty',
      'Microsoft.EditArray',
      'Microsoft.InitProperty',
      'Microsoft.SaveEntity',
      'Microsoft.SetProperty',
    ],
  },
  [DialogGroup.STEP]: {
    label: 'Conversational flow and dialog management',
    types: [
      'Microsoft.BeginDialog',
      'Microsoft.CancelAllDialogs',
      'Microsoft.EmitEvent',
      'Microsoft.EndDialog',
      'Microsoft.EndTurn',
      'Microsoft.IfCondition',
      'Microsoft.RepeatDialog',
      'Microsoft.ReplaceDialog',
      'Microsoft.SendActivity',
      'Microsoft.SwitchCondition',
    ],
  },
  [DialogGroup.CODE]: {
    label: 'Roll your own code',
    types: ['Microsoft.CodeStep', 'Microsoft.HttpRequest'],
  },
  [DialogGroup.LOG]: {
    label: 'Tracing and logging',
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
