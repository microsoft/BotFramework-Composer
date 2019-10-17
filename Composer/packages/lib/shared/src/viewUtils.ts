import { IContextualMenuItem, IContextualMenuProps } from 'office-ui-fabric-react';

import { SDKTypes } from './types';
import { ConceptLabels } from './labelMap';
import { seedNewDialog } from './dialogFactory';

export const PROMPT_TYPES = [
  SDKTypes.AttachmentInput,
  SDKTypes.ChoiceInput,
  SDKTypes.ConfirmInput,
  SDKTypes.DateTimeInput,
  SDKTypes.NumberInput,
  SDKTypes.TextInput,
];

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
      SDKTypes.OnIntent,
      SDKTypes.OnUnknownIntent,
      SDKTypes.OnConversationUpdateActivity,
      SDKTypes.OnBeginDialog,
      SDKTypes.OnDialogEvent,
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
  subMenu = true,
  handleType: (e: any, item: IContextualMenuItem) => void,
  filter?: (x: SDKTypes) => boolean
): IContextualMenuItem[] => {
  if (subMenu) {
    const stepMenuItems = stepLabels.map(x => {
      const item = dialogGroups[x];
      const subMenu: IContextualMenuProps = {
        items: item.types.filter(filter || (x => true)).map($type => ({
          key: $type,
          name: ConceptLabels[$type] && ConceptLabels[$type].title ? ConceptLabels[$type].title : $type,
          $type: $type,
        })),
        onItemClick: (e, item: IContextualMenuItem | undefined) => {
          if (item) {
            item = {
              ...item,
              $type: item.$type,
              ...seedNewDialog(item.$type, {
                name:
                  ConceptLabels[item.$type] && ConceptLabels[item.$type].title
                    ? ConceptLabels[item.$type].title
                    : item.$type,
              }),
              data: {
                $type: item.$type, // used by the steps field to create the item
                ...seedNewDialog(item.$type, {
                  name:
                    ConceptLabels[item.$type] && ConceptLabels[item.$type].title
                      ? ConceptLabels[item.$type].title
                      : item.$type,
                }),
              },
            };
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
        ...seedNewDialog(item, {
          name,
        }),
        data: {
          $type: item,
          ...seedNewDialog(item, {
            name,
          }),
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
