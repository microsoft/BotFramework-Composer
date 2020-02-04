// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IContextualMenuItem,
  IContextualMenuProps,
} from 'office-ui-fabric-react/lib/components/ContextualMenu/ContextualMenu.types';
import get from 'lodash/get';

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
  MESSAGE_EVENTS = 'MESSAGE_EVENTS',
  DIALOG_EVENT_TYPES = 'DIALOG_EVENT_TYPES',
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
    label: 'Ask a question',
    types: [
      SDKTypes.TextInput,
      SDKTypes.NumberInput,
      SDKTypes.ConfirmInput,
      SDKTypes.ChoiceInput,
      SDKTypes.AttachmentInput,
      SDKTypes.DateTimeInput,
      SDKTypes.OAuthInput,
    ],
  },
  [DialogGroup.BRANCHING]: {
    label: 'Create a condition',
    types: [SDKTypes.IfCondition, SDKTypes.SwitchCondition, SDKTypes.Foreach, SDKTypes.ForeachPage],
  },
  [DialogGroup.MEMORY]: {
    label: 'Manage properties',
    types: [
      SDKTypes.SetProperty,
      SDKTypes.SetProperties,
      SDKTypes.InitProperty,
      SDKTypes.DeleteProperty,
      SDKTypes.DeleteProperties,
      SDKTypes.EditArray,
    ],
  },
  [DialogGroup.STEP]: {
    label: 'Dialog management',
    types: [
      SDKTypes.BeginDialog,
      SDKTypes.EndDialog,
      SDKTypes.CancelAllDialogs,
      SDKTypes.EndTurn,
      SDKTypes.RepeatDialog,
      SDKTypes.ReplaceDialog,
    ],
  },
  [DialogGroup.CODE]: {
    label: 'Access external resources',
    types: [
      SDKTypes.HttpRequest,
      SDKTypes.EmitEvent,
      SDKTypes.OAuthInput,
      SDKTypes.QnAMakerDialog,
      //  SDKTypes.CodeStep
    ],
  },
  [DialogGroup.LOG]: {
    label: 'Debugging options',
    types: [/* SDKTypes.DebugBreak, */ SDKTypes.LogAction, SDKTypes.TraceActivity],
  },
  [DialogGroup.EVENTS]: {
    label: 'Events',
    types: [
      SDKTypes.OnIntent,
      SDKTypes.OnUnknownIntent,
      SDKTypes.OnDialogEvent,
      SDKTypes.OnActivity,
      SDKTypes.OnMessageActivity,
      SDKTypes.OnCustomEvent,
    ],
  },
  [DialogGroup.DIALOG_EVENT_TYPES]: {
    label: 'OnDialogEvents Types',
    types: [SDKTypes.OnBeginDialog, SDKTypes.OnCancelDialog, SDKTypes.OnError, SDKTypes.OnRepromptDialog],
  },
  [DialogGroup.ADVANCED_EVENTS]: {
    label: 'Advanced Events',
    types: [
      SDKTypes.OnActivity,
      SDKTypes.OnConversationUpdateActivity,
      SDKTypes.OnEndOfConversationActivity,
      SDKTypes.OnEventActivity,
      SDKTypes.OnHandoffActivity,
      SDKTypes.OnInvokeActivity,
      SDKTypes.OnTypingActivity,
    ],
  },
  [DialogGroup.MESSAGE_EVENTS]: {
    label: 'Message events',
    types: [
      SDKTypes.OnMessageActivity,
      SDKTypes.OnMessageDeleteActivity,
      SDKTypes.OnMessageReactionActivity,
      SDKTypes.OnMessageUpdateActivity,
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

const menuItemHandler = (
  handleType: (
    e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined,
    item: IContextualMenuItem
  ) => void
) => (
  e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined,
  item: IContextualMenuItem | undefined
) => {
  if (item) {
    item = {
      ...item,
      $type: item.$type,
      ...seedNewDialog(item.$type, {
        name:
          ConceptLabels[item.$type] && ConceptLabels[item.$type].title ? ConceptLabels[item.$type].title : item.$type,
      }),
      data: {
        $type: item.$type, // used by the steps field to create the item
        ...seedNewDialog(item.$type, {
          name:
            ConceptLabels[item.$type] && ConceptLabels[item.$type].title ? ConceptLabels[item.$type].title : item.$type,
        }),
      },
    };
    return handleType(e, item);
  }
};

export const createStepMenu = (
  stepLabels: DialogGroup[],
  subMenu = true,
  handleType: (
    e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined,
    item: IContextualMenuItem
  ) => void,
  filter?: (x: SDKTypes) => boolean
): IContextualMenuItem[] => {
  if (subMenu) {
    const stepMenuItems = stepLabels.map(x => {
      const item = dialogGroups[x];
      if (item.types.length === 1) {
        const conceptLabel = ConceptLabels[item.types[0]];
        return {
          key: item.types[0],
          name: conceptLabel && conceptLabel.title ? conceptLabel.title : item.types[0],
          $type: item.types[0],
          onClick: menuItemHandler(handleType),
        };
      }
      const subMenu: IContextualMenuProps = {
        items: item.types.filter(filter || (() => true)).map($type => {
          const conceptLabel = ConceptLabels[$type];

          return {
            key: $type,
            name: conceptLabel && conceptLabel.title ? conceptLabel.title : $type,
            $type: $type,
          };
        }),
        onItemClick: menuItemHandler(handleType),
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
      const conceptLabel = ConceptLabels[item];
      const name = conceptLabel && conceptLabel.title ? conceptLabel.title : item;
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

const truncateSDKType = $type => (typeof $type === 'string' ? $type.split('Microsoft.')[1] : '');

/**
 * Title priority: $designer.name > title from sdk schema > customize title > $type suffix
 * @param customizedTitile customized title
 */
export function generateSDKTitle(data, customizedTitile?: string) {
  const $type = get(data, '$type');
  const titleFrom$designer = get(data, '$designer.name');
  const titleFromShared = get(ConceptLabels, [$type, 'title']);
  const titleFrom$type = truncateSDKType($type);
  return titleFrom$designer || customizedTitile || titleFromShared || titleFrom$type;
}

export function getInputType($type: string): string {
  if (!$type) return '';
  return $type.replace(/Microsoft.(.*)Input/, '$1');
}
