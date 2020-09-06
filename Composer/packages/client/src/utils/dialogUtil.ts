// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ConceptLabels,
  DialogGroup,
  SDKKinds,
  dialogGroups,
  DialogInfo,
  DialogFactory,
  ITriggerCondition,
} from '@bfc/shared';
import get from 'lodash/get';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import formatMessage from 'format-message';

import { getFocusPath } from './navigation';
import { upperCaseName } from './fileUtil';

interface DialogsMap {
  [dialogId: string]: any;
}

export interface TriggerFormData {
  errors: TriggerFormDataErrors;
  $kind: string;
  event: string;
  intent: string;
  triggerPhrases: string;
  regEx: string;
}

export interface TriggerFormDataErrors {
  $kind?: string;
  intent?: string;
  event?: string;
  triggerPhrases?: string;
  regEx?: string;
  activity?: string;
}

export function getDialog(dialogs: DialogInfo[], dialogId: string) {
  const dialog = dialogs.find((item) => item.id === dialogId);
  return cloneDeep(dialog);
}

export const eventTypeKey: string = SDKKinds.OnDialogEvent;
export const intentTypeKey: string = SDKKinds.OnIntent;
export const qnaTypeKey: string = SDKKinds.OnQnAMatch;
export const activityTypeKey: string = SDKKinds.OnActivity;
export const regexRecognizerKey: string = SDKKinds.RegexRecognizer;
export const crossTrainedRecognizerSetKey: string = SDKKinds.CrossTrainedRecognizerSet;
export const customEventKey = 'OnCustomEvent';
export const qnaMatcherKey: string = SDKKinds.OnQnAMatch;
export const onChooseIntentKey: string = SDKKinds.OnChooseIntent;

function insert(content, path: string, position: number | undefined, data: any) {
  const current = get(content, path, []);
  const insertAt = typeof position === 'undefined' ? current.length : position;
  current.splice(insertAt, 0, data);
  set(content, path, current);
  return content;
}

function generateNewTrigger(data: TriggerFormData, factory: DialogFactory) {
  const optionalAttributes: { intent?: string; event?: string; $designer: { [key: string]: string } } = {
    $designer: {},
  };

  if (data.event) {
    optionalAttributes.event = data.event;
    optionalAttributes.$designer.name = data.event;
  }

  if (data.intent) {
    optionalAttributes.intent = data.intent;
    optionalAttributes.$designer.name = data.intent;
  }
  const newStep = factory.create(data.$kind as SDKKinds, optionalAttributes);
  return newStep;
}

function generateRegexExpression(intent: string, pattern: string) {
  return { intent, pattern };
}

function createTrigger(dialog: DialogInfo, data: TriggerFormData, factory: DialogFactory): DialogInfo {
  const dialogCopy = cloneDeep(dialog);
  const trigger = generateNewTrigger(data, factory);
  insert(dialogCopy.content, 'triggers', undefined, trigger);
  return dialogCopy;
}

export function updateIntentTrigger(dialog: DialogInfo, intentName: string, newIntentName: string): DialogInfo {
  const dialogCopy = cloneDeep(dialog);
  const trigger = (dialogCopy.content?.triggers ?? []).find(
    (t) => t.$kind === SDKKinds.OnIntent && t.intent === intentName
  );

  if (trigger) {
    trigger.intent = newIntentName;
  }

  return dialogCopy;
}

function createRegExIntent(dialog: DialogInfo, intent: string, pattern: string): DialogInfo {
  const regex = generateRegexExpression(intent, pattern);
  const dialogCopy = cloneDeep(dialog);
  insert(dialogCopy.content, 'recognizer.intents', undefined, regex);
  return dialogCopy;
}

export function renameRegExIntent(dialog: DialogInfo, intentName: string, newIntentName: string): DialogInfo {
  const dialogCopy = cloneDeep(dialog);
  const regexIntents = get(dialogCopy, 'content.recognizer.intents', []);
  const targetIntent = regexIntents.find((ri) => ri.intent === intentName);
  if (!targetIntent || !newIntentName) {
    return dialogCopy;
  }

  targetIntent.intent = newIntentName;

  return updateIntentTrigger(dialogCopy, intentName, newIntentName);
}

export function updateRegExIntent(dialog: DialogInfo, intent: string, pattern: string): DialogInfo {
  let dialogCopy = cloneDeep(dialog);
  const regexIntents = get(dialogCopy, 'content.recognizer.intents', []);
  const targetIntent = regexIntents.find((ri) => ri.intent === intent);
  if (!targetIntent) {
    dialogCopy = createRegExIntent(dialog, intent, pattern);
  } else {
    targetIntent.pattern = pattern;
  }
  return dialogCopy;
}

//it is possible that we cannot find a RegEx. Because it will clear all regEx when we
//switch to another recognizer type
function deleteRegExIntent(dialog: DialogInfo, intent: string): DialogInfo {
  const dialogCopy = cloneDeep(dialog);
  const regexIntents = get(dialogCopy, 'content.recognizer.intents', []);
  const index = regexIntents.findIndex((ri) => ri.intent === intent);
  if (index > -1) {
    regexIntents.splice(index, 1);
  }
  return dialogCopy;
}

export function generateNewDialog(
  dialogs: DialogInfo[],
  dialogId: string,
  data: TriggerFormData,
  schema: any
): DialogInfo {
  //add new trigger
  const dialog = dialogs.find((dialog) => dialog.id === dialogId);
  if (!dialog) throw new Error(`dialog ${dialogId} does not exist`);
  const factory = new DialogFactory(schema);
  let updatedDialog = createTrigger(dialog, data, factory);
  //add regex expression
  if (data.regEx) {
    updatedDialog = createRegExIntent(updatedDialog, data.intent, data.regEx);
  }
  return updatedDialog;
}

export function createSelectedPath(selected: number) {
  return `triggers[${selected}]`;
}

export function deleteTrigger(
  dialogs: DialogInfo[],
  dialogId: string,
  index: number,
  callbackOnDeletedTrigger?: (trigger: ITriggerCondition) => any
) {
  let dialogCopy = getDialog(dialogs, dialogId);
  if (!dialogCopy) return null;
  const isRegEx = get(dialogCopy, 'content.recognizer.$kind', '') === regexRecognizerKey;
  if (isRegEx) {
    const regExIntent = get(dialogCopy, `content.triggers[${index}].intent`, '');
    dialogCopy = deleteRegExIntent(dialogCopy, regExIntent);
  }
  const triggers = get(dialogCopy, 'content.triggers');
  const removedTriggers = triggers.splice(index, 1);
  if (callbackOnDeletedTrigger && removedTriggers[0]) {
    callbackOnDeletedTrigger(removedTriggers[0]);
  }
  return dialogCopy.content;
}

export function getTriggerTypes(): IDropdownOption[] {
  const triggerTypes: IDropdownOption[] = [
    ...dialogGroups[DialogGroup.EVENTS].types.map((t) => {
      let name = t as string;
      const labelOverrides = ConceptLabels[t];

      if (labelOverrides && labelOverrides.title) {
        name = labelOverrides.title;
      }

      return { key: t, text: name || t };
    }),
    {
      key: customEventKey,
      text: formatMessage('Custom events'),
    },
  ];
  return triggerTypes;
}

export function getEventTypes(): IComboBoxOption[] {
  const eventTypes: IComboBoxOption[] = [
    ...dialogGroups[DialogGroup.DIALOG_EVENT_TYPES].types.map((t) => {
      let name = t as string;
      const labelOverrides = ConceptLabels[t];

      if (labelOverrides && labelOverrides.title) {
        if (labelOverrides.subtitle) {
          name = `${labelOverrides.title} (${labelOverrides.subtitle})`;
        } else {
          name = labelOverrides.title;
        }
      }

      return { key: t, text: name || t };
    }),
  ];
  return eventTypes;
}

export function getActivityTypes(): IDropdownOption[] {
  const activityTypes: IDropdownOption[] = [
    ...dialogGroups[DialogGroup.ADVANCED_EVENTS].types.map((t) => {
      let name = t as string;
      const labelOverrides = ConceptLabels[t];

      if (labelOverrides && labelOverrides.title) {
        if (labelOverrides.subtitle) {
          name = `${labelOverrides.title} (${labelOverrides.subtitle})`;
        } else {
          name = labelOverrides.title;
        }
      }

      return { key: t, text: name || t };
    }),
  ];
  return activityTypes;
}

function getDialogsMap(dialogs: DialogInfo[]): DialogsMap {
  return dialogs.reduce((result, dialog) => {
    result[dialog.id] = dialog.content;
    return result;
  }, {});
}

export function getFriendlyName(data) {
  if (get(data, '$designer.name')) {
    return get(data, '$designer.name');
  }

  if (get(data, 'intent')) {
    return `${get(data, 'intent')}`;
  }

  if (ConceptLabels[data.$kind] && ConceptLabels[data.$kind].title) {
    return ConceptLabels[data.$kind].title;
  }

  return data.$kind;
}

const getLabel = (dialog: DialogInfo, dataPath: string) => {
  const data = get(dialog, dataPath);
  if (!data) return '';
  return getFriendlyName(data);
};

export function getbreadcrumbLabel(dialogs: DialogInfo[], dialogId: string, selected: string, focused: string) {
  let label = '';
  const dataPath = getFocusPath(selected, focused);
  if (!dataPath) {
    const dialog = dialogs.find((d) => d.id === dialogId);
    label = (dialog && dialog.displayName) || '';
  } else {
    const dialogsMap = getDialogsMap(dialogs);
    const dialog = dialogsMap[dialogId];
    label = getLabel(dialog, dataPath);
  }

  label = upperCaseName(label || '');
  return label;
}

export function getDialogData(dialogsMap: DialogsMap, dialogId: string, dataPath = '') {
  if (!dialogId) return '';
  const dialog = dialogsMap[dialogId];

  if (!dataPath) {
    return dialog;
  }

  return ConceptLabels[get(dialog, dataPath)] ? ConceptLabels[get(dialog, dataPath)].title : get(dialog, dataPath);
}

export function setDialogData(dialogsMap: DialogsMap, dialogId: string, dataPath: string, data: any) {
  const dialog = cloneDeep(dialogsMap[dialogId]);

  if (!dataPath) {
    return data;
  }
  return set(dialog, dataPath, data);
}

export function getSelected(focused: string): string {
  if (!focused) return '';
  return focused.split('.')[0];
}

export function replaceDialogDiagnosticLabel(path?: string): string {
  if (!path) return '';
  let list = path.split('#');
  list = list.map((item) => {
    return ConceptLabels[item]?.title || item;
  });
  return list.join(': ');
}
