// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import formatMessage from 'format-message';
import { SDKKinds } from '@botframework-composer/types';

import { PromptTab, PromptTabTitles } from './promptTabs';

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
    label: formatMessage('Send Messages'),
    types: [SDKKinds.SendActivity],
  },
  [DialogGroup.INPUT]: {
    label: formatMessage('Ask the user'),
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
    label: formatMessage('Create a condition'),
    types: [SDKKinds.IfCondition, SDKKinds.SwitchCondition],
  },
  [DialogGroup.LOOPING]: {
    label: formatMessage('Looping'),
    types: [SDKKinds.Foreach, SDKKinds.ForeachPage, SDKKinds.ContinueLoop, SDKKinds.BreakLoop],
  },
  [DialogGroup.MEMORY]: {
    label: formatMessage('Manage properties'),
    types: [
      SDKKinds.SetProperty,
      SDKKinds.SetProperties,
      SDKKinds.DeleteProperty,
      SDKKinds.DeleteProperties,
      SDKKinds.EditArray,
    ],
  },
  [DialogGroup.STEP]: {
    label: formatMessage('Dialog management'),
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
    label: formatMessage('Access external resources'),
    types: [
      SDKKinds.BeginSkill,
      SDKKinds.HttpRequest,
      SDKKinds.EmitEvent,
      SDKKinds.OAuthInput,
      SDKKinds.QnAMakerDialog,
      SDKKinds.SignOutUser,
      //  SDKKinds.CodeStep
    ],
  },
  [DialogGroup.LOG]: {
    label: formatMessage('Debugging options'),
    types: [/* SDKKinds.DebugBreak, */ SDKKinds.LogAction, SDKKinds.TraceActivity],
  },
  [DialogGroup.EVENTS]: {
    label: formatMessage('Events'),
    types: [
      SDKKinds.OnIntent,
      SDKKinds.OnQnAMatch,
      SDKKinds.OnUnknownIntent,
      SDKKinds.OnDialogEvent,
      SDKKinds.OnActivity,
      SDKKinds.OnChooseIntent,
    ],
  },
  [DialogGroup.DIALOG_EVENT_TYPES]: {
    label: formatMessage('OnDialogEvents Types'),
    types: [SDKKinds.OnBeginDialog, SDKKinds.OnCancelDialog, SDKKinds.OnError, SDKKinds.OnRepromptDialog],
  },
  [DialogGroup.ADVANCED_EVENTS]: {
    label: formatMessage('Advanced Events'),
    types: [
      SDKKinds.OnActivity,
      SDKKinds.OnConversationUpdateActivity,
      SDKKinds.OnEndOfConversationActivity,
      SDKKinds.OnEventActivity,
      SDKKinds.OnHandoffActivity,
      SDKKinds.OnInvokeActivity,
      SDKKinds.OnTypingActivity,
      SDKKinds.OnMessageActivity,
      SDKKinds.OnMessageDeleteActivity,
      SDKKinds.OnMessageReactionActivity,
      SDKKinds.OnMessageUpdateActivity,
    ],
  },
  [DialogGroup.RECOGNIZER]: {
    label: formatMessage('Recognizers'),
    types: [SDKKinds.LuisRecognizer, /* SDKKinds.MultiLanguageRecognizers, */ SDKKinds.RegexRecognizer],
  },
  [DialogGroup.SELECTOR]: {
    label: formatMessage('Selectors'),
    types: [
      SDKKinds.ConditionalSelector,
      SDKKinds.FirstSelector,
      SDKKinds.MostSpecificSelector,
      SDKKinds.RandomSelector,
      SDKKinds.TrueSelector,
    ],
  },
  [DialogGroup.OTHER]: {
    label: formatMessage('Other'),
    types: [SDKKinds.AdaptiveDialog],
  },
};

export function getDialogGroupByType(type) {
  let dialogType = DialogGroup.OTHER;

  Object.keys(dialogGroups).forEach((key) => {
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

const truncateSDKType = ($kind) => (typeof $kind === 'string' ? $kind.replace('Microsoft.', '') : '');

// string type comes from sdk.schema, function type comes from FormUIOptions.
type SDKTitle = string | ((data: any) => string);

const getSDKTitle = (data, sdkTitle?: SDKTitle) => {
  if (!sdkTitle) return;
  // Handle the case that FormUIOption label function overrides sdk.schema.
  return typeof sdkTitle === 'function' ? sdkTitle(data) : sdkTitle;
};

/**
 * Title priority: $designer.name > title from sdk schema > customize title > $kind suffix
 * @param customizedTitile customized title
 */
export function generateActionTitle(data, sdkTitle?: SDKTitle, customizedTitle?: string, tab?: PromptTab) {
  const $kind = get(data, '$kind');
  const titleFromSDKSchema = getSDKTitle(data, sdkTitle);
  const titleFrom$designer = get(data, '$designer.name');
  const titleFrom$kind = truncateSDKType($kind);

  const title = titleFrom$designer || titleFromSDKSchema || customizedTitle || titleFrom$kind;
  if (tab) {
    const tabTitle = typeof PromptTabTitles[tab] === 'function' ? PromptTabTitles[tab]() : tab;
    return `${tabTitle} (${title})`;
  }
  return title;
}

export function getInputType($kind: string): string {
  if (!$kind) return '';
  return $kind.replace(/Microsoft.(.*)Input/, '$1');
}
