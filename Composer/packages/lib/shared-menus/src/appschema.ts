// export const DialogGroup = {
//   RESPONSE: 'RESPONSE',
//   INPUT: 'INPUT',
//   BRANCHING: 'BRANCHING',
//   MEMORY: 'MEMORY',
//   STEP: 'STEP',
//   CODE: 'CODE',
//   LOG: 'LOG',
//   RULE: 'RULE',
//   RECOGNIZER: 'RECOGNIZER',
//   SELECTOR: 'SELECTOR',
//   OTHER: 'OTHER',
// };

export enum DialogGroup {
  RESPONSE = 'RESPONSE',
  INPUT = 'INPUT',
  BRANCHING = 'BRANCHING',
  MEMORY = 'MEMORY',
  STEP = 'STEP',
  CODE = 'CODE',
  LOG = 'LOG',
  RULE = 'RULE',
  RECOGNIZER = 'RECOGNIZER',
  SELECTOR = 'SELECTOR',
  OTHER = 'OTHER',
}

export interface DialogGroupItem {
  label: string;
  types: string[];
}
export type DialogGroupsMap = { [key in DialogGroup]: DialogGroupItem };

export const dialogGroups: DialogGroupsMap = {
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

export function getDialogGroupByType(type) {
  let dialogType = DialogGroup.OTHER;

  Object.keys(dialogGroups).forEach(key => {
    if (dialogGroups[key].types.indexOf(type) > -1) {
      switch (key) {
        case DialogGroup.INPUT:
        case DialogGroup.RESPONSE:
        case DialogGroup.BRANCHING:
        case DialogGroup.RULE:
          dialogType = key;
          break;
        case DialogGroup.STEP:
          if (type.indexOf('Condition') > -1) {
            dialogType = key;
          }
          break;
        default:
          dialogType = DialogGroup.OTHER;
          break;
      }
    }
  });

  return dialogType;
}
