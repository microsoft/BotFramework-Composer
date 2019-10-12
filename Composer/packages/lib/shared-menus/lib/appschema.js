var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var _a;
import { ConceptLabels } from './labelMap';
import { seedNewDialog } from './dialogFactory';
// All of the known SDK types. Update this list when we take a schema update.
// To get this list copy the output of the following commands in a node repl from the project root:
// const schema = JSON.parse(fs.readFileSync('./BotProject/CSharp/Schemas/sdk.schema', 'utf-8'));
// const types = schema.oneOf.map(t => t.title);
// let uType = 'export enum SDKTypes {\n';
// uType += types.map(t => `  ${t.replace('Microsoft.', '')} = '${t}',`).join('\n');
// uType += '\n}';
// console.log(uType);
/**
 * All SDK Types defined by the schema.
 * All references of the type should be accessed through this enum.
 * */
export var SDKTypes;
(function(SDKTypes) {
  SDKTypes['AdaptiveDialog'] = 'Microsoft.AdaptiveDialog';
  SDKTypes['AgeEntityRecognizer'] = 'Microsoft.AgeEntityRecognizer';
  SDKTypes['AttachmentInput'] = 'Microsoft.AttachmentInput';
  SDKTypes['BeginDialog'] = 'Microsoft.BeginDialog';
  SDKTypes['CancelAllDialogs'] = 'Microsoft.CancelAllDialogs';
  SDKTypes['ChoiceInput'] = 'Microsoft.ChoiceInput';
  SDKTypes['ConditionalSelector'] = 'Microsoft.ConditionalSelector';
  SDKTypes['ConfirmInput'] = 'Microsoft.ConfirmInput';
  SDKTypes['ConfirmationEntityRecognizer'] = 'Microsoft.ConfirmationEntityRecognizer';
  SDKTypes['CurrencyEntityRecognizer'] = 'Microsoft.CurrencyEntityRecognizer';
  SDKTypes['DateTimeEntityRecognizer'] = 'Microsoft.DateTimeEntityRecognizer';
  SDKTypes['DateTimeInput'] = 'Microsoft.DateTimeInput';
  SDKTypes['DebugBreak'] = 'Microsoft.DebugBreak';
  SDKTypes['DeleteProperty'] = 'Microsoft.DeleteProperty';
  SDKTypes['DimensionEntityRecognizer'] = 'Microsoft.DimensionEntityRecognizer';
  SDKTypes['EditActions'] = 'Microsoft.EditActions';
  SDKTypes['EditArray'] = 'Microsoft.EditArray';
  SDKTypes['EmailEntityRecognizer'] = 'Microsoft.EmailEntityRecognizer';
  SDKTypes['EmitEvent'] = 'Microsoft.EmitEvent';
  SDKTypes['EndDialog'] = 'Microsoft.EndDialog';
  SDKTypes['EndTurn'] = 'Microsoft.EndTurn';
  SDKTypes['FirstSelector'] = 'Microsoft.FirstSelector';
  SDKTypes['Foreach'] = 'Microsoft.Foreach';
  SDKTypes['ForeachPage'] = 'Microsoft.ForeachPage';
  SDKTypes['GuidEntityRecognizer'] = 'Microsoft.GuidEntityRecognizer';
  SDKTypes['HashtagEntityRecognizer'] = 'Microsoft.HashtagEntityRecognizer';
  SDKTypes['HttpRequest'] = 'Microsoft.HttpRequest';
  SDKTypes['IfCondition'] = 'Microsoft.IfCondition';
  SDKTypes['InitProperty'] = 'Microsoft.InitProperty';
  SDKTypes['IpEntityRecognizer'] = 'Microsoft.IpEntityRecognizer';
  SDKTypes['LanguagePolicy'] = 'Microsoft.LanguagePolicy';
  SDKTypes['LogAction'] = 'Microsoft.LogAction';
  SDKTypes['LuisRecognizer'] = 'Microsoft.LuisRecognizer';
  SDKTypes['MentionEntityRecognizer'] = 'Microsoft.MentionEntityRecognizer';
  SDKTypes['MostSpecificSelector'] = 'Microsoft.MostSpecificSelector';
  SDKTypes['MultiLanguageRecognizer'] = 'Microsoft.MultiLanguageRecognizer';
  SDKTypes['NumberEntityRecognizer'] = 'Microsoft.NumberEntityRecognizer';
  SDKTypes['NumberInput'] = 'Microsoft.NumberInput';
  SDKTypes['NumberRangeEntityRecognizer'] = 'Microsoft.NumberRangeEntityRecognizer';
  SDKTypes['OAuthInput'] = 'Microsoft.OAuthInput';
  SDKTypes['OnActivity'] = 'Microsoft.OnActivity';
  SDKTypes['OnBeginDialog'] = 'Microsoft.OnBeginDialog';
  SDKTypes['OnConversationUpdateActivity'] = 'Microsoft.OnConversationUpdateActivity';
  SDKTypes['OnDialogEvent'] = 'Microsoft.OnDialogEvent';
  SDKTypes['OnEndOfConversationActivity'] = 'Microsoft.OnEndOfConversationActivity';
  SDKTypes['OnEvent'] = 'Microsoft.OnEvent';
  SDKTypes['OnEventActivity'] = 'Microsoft.OnEventActivity';
  SDKTypes['OnHandoffActivity'] = 'Microsoft.OnHandoffActivity';
  SDKTypes['OnIntent'] = 'Microsoft.OnIntent';
  SDKTypes['OnInvokeActivity'] = 'Microsoft.OnInvokeActivity';
  SDKTypes['OnMessageActivity'] = 'Microsoft.OnMessageActivity';
  SDKTypes['OnMessageDeleteActivity'] = 'Microsoft.OnMessageDeleteActivity';
  SDKTypes['OnMessageReactionActivity'] = 'Microsoft.OnMessageReactionActivity';
  SDKTypes['OnMessageUpdateActivity'] = 'Microsoft.OnMessageUpdateActivity';
  SDKTypes['OnTypingActivity'] = 'Microsoft.OnTypingActivity';
  SDKTypes['OnUnknownIntent'] = 'Microsoft.OnUnknownIntent';
  SDKTypes['OrdinalEntityRecognizer'] = 'Microsoft.OrdinalEntityRecognizer';
  SDKTypes['PercentageEntityRecognizer'] = 'Microsoft.PercentageEntityRecognizer';
  SDKTypes['PhoneNumberEntityRecognizer'] = 'Microsoft.PhoneNumberEntityRecognizer';
  SDKTypes['QnAMakerDialog'] = 'Microsoft.QnAMakerDialog';
  SDKTypes['RandomSelector'] = 'Microsoft.RandomSelector';
  SDKTypes['RegexEntityRecognizer'] = 'Microsoft.RegexEntityRecognizer';
  SDKTypes['RegexRecognizer'] = 'Microsoft.RegexRecognizer';
  SDKTypes['RepeatDialog'] = 'Microsoft.RepeatDialog';
  SDKTypes['ReplaceDialog'] = 'Microsoft.ReplaceDialog';
  SDKTypes['SendActivity'] = 'Microsoft.SendActivity';
  SDKTypes['SetProperty'] = 'Microsoft.SetProperty';
  SDKTypes['SwitchCondition'] = 'Microsoft.SwitchCondition';
  SDKTypes['TemperatureEntityRecognizer'] = 'Microsoft.TemperatureEntityRecognizer';
  SDKTypes['TextInput'] = 'Microsoft.TextInput';
  SDKTypes['TraceActivity'] = 'Microsoft.TraceActivity';
  SDKTypes['TrueSelector'] = 'Microsoft.TrueSelector';
  SDKTypes['UrlEntityRecognizer'] = 'Microsoft.UrlEntityRecognizer';
})(SDKTypes || (SDKTypes = {}));
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
  DialogGroup['ADVANCED_EVENTS'] = 'ADVANCED_EVENTS';
  DialogGroup['RECOGNIZER'] = 'RECOGNIZER';
  DialogGroup['SELECTOR'] = 'SELECTOR';
  DialogGroup['OTHER'] = 'OTHER';
})(DialogGroup || (DialogGroup = {}));
export var dialogGroups = ((_a = {}),
(_a[DialogGroup.RESPONSE] = {
  label: 'Send Messages',
  types: [SDKTypes.SendActivity],
}),
(_a[DialogGroup.INPUT] = {
  label: 'Ask a Question',
  types: [
    SDKTypes.TextInput,
    SDKTypes.NumberInput,
    SDKTypes.ConfirmInput,
    SDKTypes.ChoiceInput,
    SDKTypes.AttachmentInput,
    SDKTypes.DateTimeInput,
  ],
}),
(_a[DialogGroup.BRANCHING] = {
  label: 'Flow',
  types: [SDKTypes.IfCondition, SDKTypes.SwitchCondition, SDKTypes.Foreach, SDKTypes.ForeachPage],
}),
(_a[DialogGroup.MEMORY] = {
  label: 'Memory manipulation',
  types: [SDKTypes.SetProperty, SDKTypes.InitProperty, SDKTypes.DeleteProperty, SDKTypes.EditArray],
}),
(_a[DialogGroup.STEP] = {
  label: 'Dialogs',
  types: [
    SDKTypes.BeginDialog,
    SDKTypes.EndDialog,
    SDKTypes.CancelAllDialogs,
    SDKTypes.EndTurn,
    SDKTypes.RepeatDialog,
    SDKTypes.ReplaceDialog,
    SDKTypes.EditActions,
  ],
}),
(_a[DialogGroup.CODE] = {
  label: 'Integrations',
  types: [SDKTypes.HttpRequest, SDKTypes.EmitEvent, SDKTypes.OAuthInput],
}),
(_a[DialogGroup.LOG] = {
  label: 'Debugging',
  types: [/* SDKTypes.DebugBreak, */ SDKTypes.LogAction, SDKTypes.TraceActivity],
}),
(_a[DialogGroup.EVENTS] = {
  label: 'Events',
  types: [
    SDKTypes.OnDialogEvent,
    SDKTypes.OnIntent,
    SDKTypes.OnUnknownIntent,
    SDKTypes.OnConversationUpdateActivity,
    SDKTypes.OnBeginDialog,
  ],
}),
(_a[DialogGroup.ADVANCED_EVENTS] = {
  label: 'Advanced Events',
  types: [
    SDKTypes.OnActivity,
    SDKTypes.OnEventActivity,
    SDKTypes.OnHandoffActivity,
    SDKTypes.OnInvokeActivity,
    SDKTypes.OnMessageActivity,
    SDKTypes.OnMessageDeleteActivity,
    SDKTypes.OnMessageReactionActivity,
    SDKTypes.OnMessageUpdateActivity,
    SDKTypes.OnTypingActivity,
  ],
}),
(_a[DialogGroup.RECOGNIZER] = {
  label: 'Recognizers',
  types: [SDKTypes.LuisRecognizer, /* SDKTypes.MultiLanguageRecognizers, */ SDKTypes.RegexRecognizer],
}),
(_a[DialogGroup.SELECTOR] = {
  label: 'Selectors',
  types: [
    SDKTypes.ConditionalSelector,
    SDKTypes.FirstSelector,
    SDKTypes.MostSpecificSelector,
    SDKTypes.RandomSelector,
    SDKTypes.TrueSelector,
  ],
}),
(_a[DialogGroup.OTHER] = {
  label: 'Other',
  types: [SDKTypes.AdaptiveDialog, SDKTypes.LanguagePolicy, SDKTypes.QnAMakerDialog],
}),
_a);
export var createStepMenu = function(stepLabels, subMenu, handleType) {
  if (subMenu === void 0) {
    subMenu = true;
  }
  if (subMenu) {
    var stepMenuItems = stepLabels.map(function(x) {
      var item = dialogGroups[x];
      var subMenu = {
        items: item.types.map(function($type) {
          return __assign(
            {
              key: $type,
              name: ConceptLabels[$type] && ConceptLabels[$type].title ? ConceptLabels[$type].title : $type,
              $type: $type,
            },
            seedNewDialog($type, {
              name: ConceptLabels[$type] && ConceptLabels[$type].title ? ConceptLabels[$type].title : $type,
            }),
            {
              data: __assign(
                { $type: $type },
                seedNewDialog($type, {
                  name: ConceptLabels[$type] && ConceptLabels[$type].title ? ConceptLabels[$type].title : $type,
                })
              ),
            }
          );
        }),
        onItemClick: function(e, item) {
          if (item) {
            return handleType(e, item);
          }
        },
      };
      var menuItem = {
        key: item.label,
        text: item.label,
        name: item.label,
        subMenuProps: subMenu,
      };
      return menuItem;
    });
    return stepMenuItems;
  } else {
    var stepMenuItems = dialogGroups[stepLabels[0]].types.map(function(item) {
      var name = ConceptLabels[item] && ConceptLabels[item].title ? ConceptLabels[item].title : item;
      var menuItem = __assign(
        { key: item, text: name, name: name, $type: item },
        seedNewDialog(item, {
          name: name,
        }),
        {
          data: __assign(
            { $type: item },
            seedNewDialog(item, {
              name: name,
            })
          ),
          onClick: function(e, item) {
            if (item) {
              return handleType(e, item);
            }
          },
        }
      );
      return menuItem;
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
        case DialogGroup.ADVANCED_EVENTS:
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
