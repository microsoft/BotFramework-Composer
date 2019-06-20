var _a;
import { ConceptLabels } from './labelMap';
export var DialogGroup;
(function(DialogGroup) {
  DialogGroup['RESPONSE'] = 'RESPONSE';
  DialogGroup['INPUT'] = 'INPUT';
  DialogGroup['BRANCHING'] = 'BRANCHING';
  DialogGroup['MEMORY'] = 'MEMORY';
  DialogGroup['STEP'] = 'STEP';
  DialogGroup['CODE'] = 'CODE';
  DialogGroup['LOG'] = 'LOG';
  DialogGroup['EVENTS'] = 'EVENTS';
  DialogGroup['RECOGNIZER'] = 'RECOGNIZER';
  DialogGroup['SELECTOR'] = 'SELECTOR';
  DialogGroup['OTHER'] = 'OTHER';
})(DialogGroup || (DialogGroup = {}));
export var dialogGroups = ((_a = {}),
(_a[DialogGroup.RESPONSE] = {
  label: 'Send Messages',
  types: ['Microsoft.SendActivity', 'Microsoft.BeginDialog'],
}),
(_a[DialogGroup.INPUT] = {
  label: 'Ask a Question',
  types: [
    'Microsoft.TextInput',
    'Microsoft.NumberInput',
    'Microsoft.IntegerInput',
    'Microsoft.FloatInput',
    'Microsoft.ConfirmInput',
    'Microsoft.ChoiceInput',
  ],
}),
(_a[DialogGroup.BRANCHING] = {
  label: 'Decisions',
  types: ['Microsoft.IfCondition', 'Microsoft.SwitchCondition'],
}),
(_a[DialogGroup.MEMORY] = {
  label: 'Memory manipulation',
  types: [
    'Microsoft.SetProperty',
    'Microsoft.SaveEntity',
    'Microsoft.InitProperty',
    'Microsoft.DeleteProperty',
    'Microsoft.EditArray',
  ],
}),
(_a[DialogGroup.STEP] = {
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
}),
(_a[DialogGroup.CODE] = {
  label: 'Roll your own code',
  types: ['Microsoft.HttpRequest', 'Microsoft.CodeStep'],
}),
(_a[DialogGroup.LOG] = {
  label: 'Debugging',
  types: ['Microsoft.LogStep', 'Microsoft.TraceActivity'],
}),
(_a[DialogGroup.EVENTS] = {
  label: 'Events',
  types: ['Microsoft.EventRule', 'Microsoft.IntentRule', 'Microsoft.UnknownIntentRule'],
}),
(_a[DialogGroup.RECOGNIZER] = {
  label: 'Recognizers',
  types: ['Microsoft.LuisRecognizer', /* 'Microsoft.MultiLanguageRecognizers', */ 'Microsoft.RegexRecognizer'],
}),
(_a[DialogGroup.SELECTOR] = {
  label: 'Selectors',
  types: [
    'Microsoft.ConditionalSelector',
    'Microsoft.FirstSelector',
    'Microsoft.MostSpecificSelector',
    'Microsoft.RandomSelector',
    'Microsoft.TrueSelector',
  ],
}),
(_a[DialogGroup.OTHER] = {
  label: 'Other',
  types: ['Microsoft.AdaptiveDialog', 'Microsoft.LanguagePolicy', 'Microsoft.QnAMakerDialog'],
}),
_a);
export var createStepMenu = function(stepLabels, subMenu, handleType) {
  if (subMenu === void 0) {
    subMenu = true;
  }
  if (subMenu) {
    var stepMenuItems = stepLabels.map(function(x) {
      var item = dialogGroups[x];
      return {
        key: item.label,
        text: item.label,
        name: item.label,
        subMenuProps: {
          items: item.types.map(function($type) {
            return {
              key: $type,
              name: ConceptLabels[$type] ? ConceptLabels[$type] : $type,
              $type: $type,
              data: {
                $type: $type,
              },
            };
          }),
          onItemClick: function(e, item) {
            return handleType(e, item);
          },
        },
      };
    });
    return stepMenuItems;
  } else {
    var stepMenuItems = dialogGroups[stepLabels[0]].types.map(function(item) {
      return {
        key: item,
        text: ConceptLabels[item],
        name: ConceptLabels[item],
        $type: item,
        data: {
          $type: item,
        },
        onClick: function(e, item) {
          return handleType(e, item);
        },
      };
    });
    return stepMenuItems;
  }
};
export function getDialogGroupByType(type) {
  var dialogType = DialogGroup.OTHER;
  Object.keys(dialogGroups).forEach(function(key) {
    if (dialogGroups[key].types.indexOf(type) > -1) {
      switch (key) {
        case DialogGroup.INPUT:
        case DialogGroup.RESPONSE:
        case DialogGroup.BRANCHING:
        case DialogGroup.EVENTS:
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
//# sourceMappingURL=appschema.js.map
