// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';

import { SDKKinds } from './types';
import { ConceptLabels } from './labelMap';

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
  LOOPING = 'LOOPING',
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
    types: [SDKKinds.IfCondition, SDKKinds.SwitchCondition],
  },
  [DialogGroup.LOOPING]: {
    label: 'Looping',
    types: [SDKKinds.Foreach, SDKKinds.ForeachPage, SDKKinds.ContinueLoop, SDKKinds.BreakLoop],
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

export function getDialogGroupByType(type) {
  let dialogType = DialogGroup.OTHER;

  Object.keys(dialogGroups).forEach(key => {
    if (dialogGroups[key].types.indexOf(type) > -1) {
      switch (key) {
        case DialogGroup.INPUT:
        case DialogGroup.RESPONSE:
        case DialogGroup.BRANCHING:
        case DialogGroup.LOOPING:
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
