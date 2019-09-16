import { IContextualMenuItem, IContextualMenuProps } from 'office-ui-fabric-react';
import nanoid from 'nanoid/generate';

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
export enum SDKTypes {
  AdaptiveDialog = 'Microsoft.AdaptiveDialog',
  AgeEntityRecognizer = 'Microsoft.AgeEntityRecognizer',
  AttachmentInput = 'Microsoft.AttachmentInput',
  BeginDialog = 'Microsoft.BeginDialog',
  CancelAllDialogs = 'Microsoft.CancelAllDialogs',
  ChoiceInput = 'Microsoft.ChoiceInput',
  ConditionalSelector = 'Microsoft.ConditionalSelector',
  ConfirmInput = 'Microsoft.ConfirmInput',
  ConfirmationEntityRecognizer = 'Microsoft.ConfirmationEntityRecognizer',
  CurrencyEntityRecognizer = 'Microsoft.CurrencyEntityRecognizer',
  DateTimeEntityRecognizer = 'Microsoft.DateTimeEntityRecognizer',
  DateTimeInput = 'Microsoft.DateTimeInput',
  DebugBreak = 'Microsoft.DebugBreak',
  DeleteProperty = 'Microsoft.DeleteProperty',
  DimensionEntityRecognizer = 'Microsoft.DimensionEntityRecognizer',
  EditActions = 'Microsoft.EditActions',
  EditArray = 'Microsoft.EditArray',
  EmailEntityRecognizer = 'Microsoft.EmailEntityRecognizer',
  EmitEvent = 'Microsoft.EmitEvent',
  EndDialog = 'Microsoft.EndDialog',
  EndTurn = 'Microsoft.EndTurn',
  FirstSelector = 'Microsoft.FirstSelector',
  Foreach = 'Microsoft.Foreach',
  ForeachPage = 'Microsoft.ForeachPage',
  GuidEntityRecognizer = 'Microsoft.GuidEntityRecognizer',
  HashtagEntityRecognizer = 'Microsoft.HashtagEntityRecognizer',
  HttpRequest = 'Microsoft.HttpRequest',
  IfCondition = 'Microsoft.IfCondition',
  InitProperty = 'Microsoft.InitProperty',
  IpEntityRecognizer = 'Microsoft.IpEntityRecognizer',
  LanguagePolicy = 'Microsoft.LanguagePolicy',
  LogAction = 'Microsoft.LogAction',
  LuisRecognizer = 'Microsoft.LuisRecognizer',
  MentionEntityRecognizer = 'Microsoft.MentionEntityRecognizer',
  MostSpecificSelector = 'Microsoft.MostSpecificSelector',
  MultiLanguageRecognizer = 'Microsoft.MultiLanguageRecognizer',
  NumberEntityRecognizer = 'Microsoft.NumberEntityRecognizer',
  NumberInput = 'Microsoft.NumberInput',
  NumberRangeEntityRecognizer = 'Microsoft.NumberRangeEntityRecognizer',
  OAuthInput = 'Microsoft.OAuthInput',
  OnActivity = 'Microsoft.OnActivity',
  OnBeginDialog = 'Microsoft.OnBeginDialog',
  OnConversationUpdateActivity = 'Microsoft.OnConversationUpdateActivity',
  OnDialogEvent = 'Microsoft.OnDialogEvent',
  OnEndOfConversationActivity = 'Microsoft.OnEndOfConversationActivity',
  OnEvent = 'Microsoft.OnEvent',
  OnEventActivity = 'Microsoft.OnEventActivity',
  OnHandoffActivity = 'Microsoft.OnHandoffActivity',
  OnIntent = 'Microsoft.OnIntent',
  OnInvokeActivity = 'Microsoft.OnInvokeActivity',
  OnMessageActivity = 'Microsoft.OnMessageActivity',
  OnMessageDeleteActivity = 'Microsoft.OnMessageDeleteActivity',
  OnMessageReactionActivity = 'Microsoft.OnMessageReactionActivity',
  OnMessageUpdateActivity = 'Microsoft.OnMessageUpdateActivity',
  OnTypingActivity = 'Microsoft.OnTypingActivity',
  OnUnknownIntent = 'Microsoft.OnUnknownIntent',
  OrdinalEntityRecognizer = 'Microsoft.OrdinalEntityRecognizer',
  PercentageEntityRecognizer = 'Microsoft.PercentageEntityRecognizer',
  PhoneNumberEntityRecognizer = 'Microsoft.PhoneNumberEntityRecognizer',
  QnAMakerDialog = 'Microsoft.QnAMakerDialog',
  RandomSelector = 'Microsoft.RandomSelector',
  RegexEntityRecognizer = 'Microsoft.RegexEntityRecognizer',
  RegexRecognizer = 'Microsoft.RegexRecognizer',
  RepeatDialog = 'Microsoft.RepeatDialog',
  ReplaceDialog = 'Microsoft.ReplaceDialog',
  SendActivity = 'Microsoft.SendActivity',
  SetProperty = 'Microsoft.SetProperty',
  SwitchCondition = 'Microsoft.SwitchCondition',
  TemperatureEntityRecognizer = 'Microsoft.TemperatureEntityRecognizer',
  TextInput = 'Microsoft.TextInput',
  TraceActivity = 'Microsoft.TraceActivity',
  TrueSelector = 'Microsoft.TrueSelector',
  UrlEntityRecognizer = 'Microsoft.UrlEntityRecognizer',
}

export enum DialogGroup {
  RESPONSE = 'RESPONSE',
  INPUT = 'INPUT',
  BRANCHING = 'BRANCHING',
  MEMORY = 'MEMORY',
  STEP = 'STEP',
  CODE = 'CODE',
  LOG = 'LOG',
  EVENTS = 'EVENTS',
  ADVANCED_EVENTS = 'ADVANCED_EVENTS',
  RECOGNIZER = 'RECOGNIZER',
  SELECTOR = 'SELECTOR',
  OTHER = 'OTHER',
}

export interface DialogGroupItem {
  label: string;
  types: SDKTypes[];
}
export type DialogGroupsMap = { [key in DialogGroup]: DialogGroupItem };

export const dialogGroups: DialogGroupsMap = {
  [DialogGroup.RESPONSE]: {
    label: 'Send Messages',
    types: [SDKTypes.SendActivity],
  },
  [DialogGroup.INPUT]: {
    label: 'Ask a Question',
    types: [
      SDKTypes.TextInput,
      SDKTypes.NumberInput,
      SDKTypes.ConfirmInput,
      SDKTypes.ChoiceInput,
      SDKTypes.AttachmentInput,
      SDKTypes.DateTimeInput,
    ],
  },
  [DialogGroup.BRANCHING]: {
    label: 'Flow',
    types: [SDKTypes.IfCondition, SDKTypes.SwitchCondition, SDKTypes.Foreach, SDKTypes.ForeachPage],
  },
  [DialogGroup.MEMORY]: {
    label: 'Memory manipulation',
    types: [SDKTypes.SetProperty, SDKTypes.InitProperty, SDKTypes.DeleteProperty, SDKTypes.EditArray],
  },
  [DialogGroup.STEP]: {
    label: 'Dialogs',
    types: [
      SDKTypes.BeginDialog,
      SDKTypes.EndDialog,
      SDKTypes.CancelAllDialogs,
      SDKTypes.EndTurn,
      SDKTypes.RepeatDialog,
      SDKTypes.ReplaceDialog,
      SDKTypes.EditActions,
      // SDKTypes.QnAMakerDialog,
    ],
  },
  [DialogGroup.CODE]: {
    label: 'Integrations',
    types: [
      SDKTypes.HttpRequest,
      SDKTypes.EmitEvent,
      SDKTypes.OAuthInput,
      //  SDKTypes.CodeStep
    ],
  },
  [DialogGroup.LOG]: {
    label: 'Debugging',
    types: [/* SDKTypes.DebugBreak, */ SDKTypes.LogAction, SDKTypes.TraceActivity],
  },
  [DialogGroup.EVENTS]: {
    label: 'Events',
    types: [
      SDKTypes.OnEvent,
      SDKTypes.OnIntent,
      SDKTypes.OnUnknownIntent,
      SDKTypes.OnConversationUpdateActivity,
      SDKTypes.OnBeginDialog,
    ],
  },
  [DialogGroup.ADVANCED_EVENTS]: {
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
  },
  [DialogGroup.RECOGNIZER]: {
    label: 'Recognizers',
    types: [SDKTypes.LuisRecognizer, /* SDKTypes.MultiLanguageRecognizers, */ SDKTypes.RegexRecognizer],
  },
  [DialogGroup.SELECTOR]: {
    label: 'Selectors',
    types: [
      SDKTypes.ConditionalSelector,
      SDKTypes.FirstSelector,
      SDKTypes.MostSpecificSelector,
      SDKTypes.RandomSelector,
      SDKTypes.TrueSelector,
    ],
  },
  [DialogGroup.OTHER]: {
    label: 'Other',
    types: [SDKTypes.AdaptiveDialog, SDKTypes.LanguagePolicy, SDKTypes.QnAMakerDialog],
  },
};

export const createStepMenu = (
  stepLabels,
  subMenu: boolean = true,
  handleType: (e: any, item: IContextualMenuItem) => void
): IContextualMenuItem[] => {
  if (subMenu) {
    const stepMenuItems = stepLabels.map(x => {
      const item = dialogGroups[x];
      const subMenu: IContextualMenuProps = {
        items: item.types.map($type => ({
          key: $type,
          name: ConceptLabels[$type] && ConceptLabels[$type].title ? ConceptLabels[$type].title : $type,
          $type: $type,
          $designer: {
            name: ConceptLabels[$type] && ConceptLabels[$type].title ? ConceptLabels[$type].title : $type,
            id: nanoid('1234567890', 6),
          },
          ...seedNewDialog($type),
          data: {
            $type: $type, // used by the steps field to create the item
            $designer: {
              name: ConceptLabels[$type] && ConceptLabels[$type].title ? ConceptLabels[$type].title : $type,
              id: nanoid('1234567890', 6),
            },
            ...seedNewDialog($type),
          },
        })),
        onItemClick: (e, item: IContextualMenuItem | undefined) => {
          if (item) {
            return handleType(e, item);
          }
        },
      };

      const menuItem: IContextualMenuItem = {
        key: item.label,
        text: item.label,
        name: item.label,
        subMenuProps: subMenu,
      };
      return menuItem;
    });

    return stepMenuItems;
  } else {
    const stepMenuItems = dialogGroups[stepLabels[0]].types.map(item => {
      const name = ConceptLabels[item] && ConceptLabels[item].title ? ConceptLabels[item].title : item;
      const menuItem: IContextualMenuItem = {
        key: item,
        text: name,
        name: name,
        $type: item,
        $designer: {
          name: name,
          id: nanoid('1234567890', 6),
        },
        ...seedNewDialog(item),
        data: {
          $type: item,
          $designer: {
            name: name,
            id: nanoid('1234567890', 6),
          },
          ...seedNewDialog(item),
        },
        onClick: (e, item: IContextualMenuItem | undefined) => {
          if (item) {
            return handleType(e, item);
          }
        },
      };
      return menuItem;
    });
    return stepMenuItems;
  }
};

export function getDialogGroupByType(type) {
  let dialogType = DialogGroup.OTHER;

  Object.keys(dialogGroups).forEach(key => {
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
