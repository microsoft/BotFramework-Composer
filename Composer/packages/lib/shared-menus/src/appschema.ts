import { IContextualMenuItem, IContextualMenuProps } from 'office-ui-fabric-react';
import nanoid from 'nanoid/generate';

import { ConceptLabels } from './labelMap';
import { seedNewDialog } from './dialogFactory';

export enum DialogGroup {
  RESPONSE = 'RESPONSE',
  INPUT = 'INPUT',
  BRANCHING = 'BRANCHING',
  MEMORY = 'MEMORY',
  STEP = 'STEP',
  CODE = 'CODE',
  LOG = 'LOG',
  EVENTS = 'EVENTS',
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
    types: ['Microsoft.SendActivity'],
  },
  [DialogGroup.INPUT]: {
    label: 'Ask a Question',
    types: [
      'Microsoft.TextInput',
      'Microsoft.NumberInput',
      'Microsoft.ConfirmInput',
      'Microsoft.ChoiceInput',
      'Microsoft.AttachmentInput',
      'Microsoft.DateTimeInput',
    ],
  },
  [DialogGroup.BRANCHING]: {
    label: 'Flow',
    types: ['Microsoft.IfCondition', 'Microsoft.SwitchCondition', 'Microsoft.Foreach', 'Microsoft.ForeachPage'],
  },
  [DialogGroup.MEMORY]: {
    label: 'Memory manipulation',
    types: ['Microsoft.SetProperty', 'Microsoft.InitProperty', 'Microsoft.DeleteProperty', 'Microsoft.EditArray'],
  },
  [DialogGroup.STEP]: {
    label: 'Dialogs',
    types: [
      'Microsoft.BeginDialog',
      'Microsoft.EndDialog',
      'Microsoft.CancelAllDialogs',
      'Microsoft.EndTurn',
      'Microsoft.RepeatDialog',
      'Microsoft.ReplaceDialog',
      'Microsoft.EditActions',
    ],
  },
  [DialogGroup.CODE]: {
    label: 'Integrations',
    types: [
      'Microsoft.HttpRequest',
      'Microsoft.EmitEvent',
      'Microsoft.OAuthInput',
      //  'Microsoft.CodeStep'
    ],
  },
  [DialogGroup.LOG]: {
    label: 'Debugging',
    types: [/* 'Microsoft.DebugBreak', */ 'Microsoft.LogAction', 'Microsoft.TraceActivity'],
  },
  [DialogGroup.EVENTS]: {
    label: 'Events',
    types: [
      'Microsoft.OnEvent',
      'Microsoft.OnIntent',
      'Microsoft.OnUnknownIntent',
      'Microsoft.OnConversationUpdateActivity',
    ],
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
      const menuItem: IContextualMenuItem = {
        key: item,
        text: ConceptLabels[item].title,
        name: ConceptLabels[item].title,
        $type: item,
        $designer: {
          name: ConceptLabels[item] && ConceptLabels[item].title ? ConceptLabels[item].title : item,
          id: nanoid('1234567890', 6),
        },
        ...seedNewDialog(item),
        data: {
          $type: item,
          $designer: {
            name: ConceptLabels[item] && ConceptLabels[item].title ? ConceptLabels[item].title : item,
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

/**
  All of the known SDK types. Update this list when we take a schema update.
  To get this list copy the output of the following commands in a node repl from the project root:

  ```js
    const schema = JSON.parse(fs.readFileSync('./BotProject/CSharp/Schemas/sdk.schema', 'utf-8'));
    const types = schema.oneOf.map(t => t.title);
    let uType = 'export type SDKTypes =';
    types.forEach(t => uType += `\n  | '${t}'`);
    uType += ';';
    console.log(uType);
  ```
*/

export type SDKTypes =
  | 'Microsoft.AdaptiveDialog'
  | 'Microsoft.AgeEntityRecognizer'
  | 'Microsoft.AttachmentInput'
  | 'Microsoft.BeginDialog'
  | 'Microsoft.CancelAllDialogs'
  | 'Microsoft.ChoiceInput'
  | 'Microsoft.ConditionalSelector'
  | 'Microsoft.ConfirmInput'
  | 'Microsoft.ConfirmationEntityRecognizer'
  | 'Microsoft.CurrencyEntityRecognizer'
  | 'Microsoft.DateTimeEntityRecognizer'
  | 'Microsoft.DateTimeInput'
  | 'Microsoft.DebugBreak'
  | 'Microsoft.DeleteProperty'
  | 'Microsoft.DimensionEntityRecognizer'
  | 'Microsoft.EditActions'
  | 'Microsoft.EditArray'
  | 'Microsoft.EmailEntityRecognizer'
  | 'Microsoft.EmitEvent'
  | 'Microsoft.EndDialog'
  | 'Microsoft.EndTurn'
  | 'Microsoft.FirstSelector'
  | 'Microsoft.Foreach'
  | 'Microsoft.ForeachPage'
  | 'Microsoft.GuidEntityRecognizer'
  | 'Microsoft.HashtagEntityRecognizer'
  | 'Microsoft.HttpRequest'
  | 'Microsoft.IfCondition'
  | 'Microsoft.InitProperty'
  | 'Microsoft.IpEntityRecognizer'
  | 'Microsoft.LanguagePolicy'
  | 'Microsoft.LogAction'
  | 'Microsoft.LuisRecognizer'
  | 'Microsoft.MentionEntityRecognizer'
  | 'Microsoft.MostSpecificSelector'
  | 'Microsoft.MultiLanguageRecognizer'
  | 'Microsoft.NumberEntityRecognizer'
  | 'Microsoft.NumberInput'
  | 'Microsoft.NumberRangeEntityRecognizer'
  | 'Microsoft.OAuthInput'
  | 'Microsoft.OnActivity'
  | 'Microsoft.OnBeginDialog'
  | 'Microsoft.OnConversationUpdateActivity'
  | 'Microsoft.OnDialogEvent'
  | 'Microsoft.OnEndOfConversationActivity'
  | 'Microsoft.OnEvent'
  | 'Microsoft.OnEventActivity'
  | 'Microsoft.OnHandoffActivity'
  | 'Microsoft.OnIntent'
  | 'Microsoft.OnInvokeActivity'
  | 'Microsoft.OnMessageActivity'
  | 'Microsoft.OnMessageDeleteActivity'
  | 'Microsoft.OnMessageReactionActivity'
  | 'Microsoft.OnMessageUpdateActivity'
  | 'Microsoft.OnTypingActivity'
  | 'Microsoft.OnUnknownIntent'
  | 'Microsoft.OrdinalEntityRecognizer'
  | 'Microsoft.PercentageEntityRecognizer'
  | 'Microsoft.PhoneNumberEntityRecognizer'
  | 'Microsoft.QnAMakerDialog'
  | 'Microsoft.RandomSelector'
  | 'Microsoft.RegexEntityRecognizer'
  | 'Microsoft.RegexRecognizer'
  | 'Microsoft.RepeatDialog'
  | 'Microsoft.ReplaceDialog'
  | 'Microsoft.SendActivity'
  | 'Microsoft.SetProperty'
  | 'Microsoft.SwitchCondition'
  | 'Microsoft.TemperatureEntityRecognizer'
  | 'Microsoft.TextInput'
  | 'Microsoft.TraceActivity'
  | 'Microsoft.TrueSelector'
  | 'Microsoft.UrlEntityRecognizer';
