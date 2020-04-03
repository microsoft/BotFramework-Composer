// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IContextualMenuItem,
  IContextualMenuProps,
} from 'office-ui-fabric-react/lib/components/ContextualMenu/ContextualMenu.types';
import get from 'lodash/get';

import { SDKKinds } from './types';
import { ConceptLabels } from './labelMap';
import { DialogFactory } from './dialogFactory';

export const PROMPT_TYPES = [
  SDKKinds.AttachmentInput,
  SDKKinds.ChoiceInput,
  SDKKinds.ConfirmInput,
  SDKKinds.DateTimeInput,
  SDKKinds.NumberInput,
  SDKKinds.TextInput,
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
  types: SDKKinds[];
}
export type DialogGroupsMap = { [key in DialogGroup]: DialogGroupItem };

export const dialogGroups: DialogGroupsMap = {
  [DialogGroup.RESPONSE]: {
    label: 'Send Messages',
    types: [SDKKinds.SendActivity],
  },
  [DialogGroup.INPUT]: {
    label: 'Ask a question',
    types: [
      SDKKinds.TextInput,
      SDKKinds.NumberInput,
      SDKKinds.ConfirmInput,
      SDKKinds.ChoiceInput,
      SDKKinds.AttachmentInput,
      SDKKinds.DateTimeInput,
      SDKKinds.OAuthInput,
    ],
  },
  [DialogGroup.BRANCHING]: {
    label: 'Create a condition',
    types: [SDKKinds.IfCondition, SDKKinds.SwitchCondition, SDKKinds.Foreach, SDKKinds.ForeachPage],
  },
  [DialogGroup.MEMORY]: {
    label: 'Manage properties',
    types: [
      SDKKinds.SetProperty,
      SDKKinds.SetProperties,
      SDKKinds.DeleteProperty,
      SDKKinds.DeleteProperties,
      SDKKinds.EditArray,
    ],
  },
  [DialogGroup.STEP]: {
    label: 'Dialog management',
    types: [
      SDKKinds.BeginDialog,
      SDKKinds.EndDialog,
      SDKKinds.CancelAllDialogs,
      SDKKinds.EndTurn,
      SDKKinds.RepeatDialog,
      SDKKinds.ReplaceDialog,
    ],
  },
  [DialogGroup.CODE]: {
    label: 'Access external resources',
    types: [
      SDKKinds.SkillDialog,
      SDKKinds.HttpRequest,
      SDKKinds.EmitEvent,
      SDKKinds.OAuthInput,
      SDKKinds.QnAMakerDialog,
      //  SDKKinds.CodeStep
    ],
  },
  [DialogGroup.LOG]: {
    label: 'Debugging options',
    types: [/* SDKKinds.DebugBreak, */ SDKKinds.LogAction, SDKKinds.TraceActivity],
  },
  [DialogGroup.EVENTS]: {
    label: 'Events',
    types: [
      SDKKinds.OnIntent,
      SDKKinds.OnUnknownIntent,
      SDKKinds.OnDialogEvent,
      SDKKinds.OnActivity,
      SDKKinds.OnMessageEventActivity,
      SDKKinds.OnCustomEvent,
    ],
  },
  [DialogGroup.DIALOG_EVENT_TYPES]: {
    label: 'OnDialogEvents Types',
    types: [SDKKinds.OnBeginDialog, SDKKinds.OnCancelDialog, SDKKinds.OnError, SDKKinds.OnRepromptDialog],
  },
  [DialogGroup.ADVANCED_EVENTS]: {
    label: 'Advanced Events',
    types: [
      SDKKinds.OnActivity,
      SDKKinds.OnConversationUpdateActivity,
      SDKKinds.OnEndOfConversationActivity,
      SDKKinds.OnEventActivity,
      SDKKinds.OnHandoffActivity,
      SDKKinds.OnInvokeActivity,
      SDKKinds.OnTypingActivity,
    ],
  },
  [DialogGroup.MESSAGE_EVENTS]: {
    label: 'Message events',
    types: [
      SDKKinds.OnMessageActivity,
      SDKKinds.OnMessageDeleteActivity,
      SDKKinds.OnMessageReactionActivity,
      SDKKinds.OnMessageUpdateActivity,
    ],
  },
  [DialogGroup.RECOGNIZER]: {
    label: 'Recognizers',
    types: [SDKKinds.LuisRecognizer, /* SDKKinds.MultiLanguageRecognizers, */ SDKKinds.RegexRecognizer],
  },
  [DialogGroup.SELECTOR]: {
    label: 'Selectors',
    types: [
      SDKKinds.ConditionalSelector,
      SDKKinds.FirstSelector,
      SDKKinds.MostSpecificSelector,
      SDKKinds.RandomSelector,
      SDKKinds.TrueSelector,
    ],
  },
  [DialogGroup.OTHER]: {
    label: 'Other',
    types: [SDKKinds.AdaptiveDialog, SDKKinds.LanguagePolicy, SDKKinds.QnAMakerDialog],
  },
};

const menuItemHandler = (
  factory: DialogFactory,
  handleType: (
    e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined,
    item: IContextualMenuItem
  ) => void
) => (
  e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined,
  item: IContextualMenuItem | undefined
) => {
  if (item) {
    const name =
      ConceptLabels[item.$kind] && ConceptLabels[item.$kind].title ? ConceptLabels[item.$kind].title : item.$kind;
    item = {
      ...item,
      data: {
        ...factory.create(item.$kind, {
          $designer: { name },
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
  factory: DialogFactory,
  filter?: (x: SDKKinds) => boolean
): IContextualMenuItem[] => {
  if (subMenu) {
    const stepMenuItems = stepLabels.map(x => {
      const item = dialogGroups[x];
      if (item.types.length === 1) {
        const conceptLabel = ConceptLabels[item.types[0]];
        return {
          key: item.types[0],
          name: conceptLabel && conceptLabel.title ? conceptLabel.title : item.types[0],
          $kind: item.types[0],
          onClick: menuItemHandler(factory, handleType),
        };
      }
      const subMenu: IContextualMenuProps = {
        items: item.types.filter(filter || (() => true)).map($kind => {
          const conceptLabel = ConceptLabels[$kind];

          return {
            key: $kind,
            name: conceptLabel && conceptLabel.title ? conceptLabel.title : $kind,
            $kind: $kind,
          };
        }),
        onItemClick: menuItemHandler(factory, handleType),
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
        $kind: item,
        ...factory.create(item, {
          $designer: { name },
        }),
        data: {
          $kind: item,
          ...factory.create(item, {
            $designer: { name },
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

const truncateSDKType = $kind => (typeof $kind === 'string' ? $kind.split('Microsoft.')[1] : '');

/**
 * Title priority: $designer.name > title from sdk schema > customize title > $kind suffix
 * @param customizedTitile customized title
 */
export function generateSDKTitle(data, customizedTitle?: string) {
  const $kind = get(data, '$kind');
  const titleFrom$designer = get(data, '$designer.name');
  const titleFromShared = get(ConceptLabels, [$kind, 'title']);
  const titleFrom$kind = truncateSDKType($kind);
  return titleFrom$designer || customizedTitle || titleFromShared || titleFrom$kind;
}

export function getInputType($kind: string): string {
  if (!$kind) return '';
  return $kind.replace(/Microsoft.(.*)Input/, '$1');
}
