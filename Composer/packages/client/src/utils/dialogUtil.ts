// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConceptLabels, DialogGroup, SDKTypes, dialogGroups, seedNewDialog } from '@bfc/shared';
import get from 'lodash/get';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import { ExpressionEngine } from 'adaptive-expressions';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { DialogInfo } from '@bfc/indexers';

import { getFocusPath } from './navigation';
import { upperCaseName } from './fileUtil';

const ExpressionParser = new ExpressionEngine();

interface DialogsMap {
  [dialogId: string]: any;
}

export interface TriggerFormData {
  errors: TriggerFormDataErrors;
  $type: string;
  specifiedType: string;
  intent: string;
  triggerPhrases: string;
  regexEx: string;
}

export interface TriggerFormDataErrors {
  $type?: string;
  intent?: string;
  specifiedType?: string;
  triggerPhrases?: string;
  regexEx?: string;
}

export function getDialog(dialogs: DialogInfo[], dialogId: string) {
  const dialog = dialogs.find(item => item.id === dialogId);
  return cloneDeep(dialog);
}

export const eventTypeKey: string = SDKTypes.OnDialogEvent;
export const intentTypeKey: string = SDKTypes.OnIntent;
export const activityTypeKey: string = SDKTypes.OnActivity;
export const messageTypeKey: string = SDKTypes.OnMessageEventActivity;
export const regexRecognizerKey: string = SDKTypes.RegexRecognizer;

export function getFriendlyName(data) {
  if (get(data, '$designer.name')) {
    return get(data, '$designer.name');
  }

  if (get(data, 'intent')) {
    return `${get(data, 'intent')}`;
  }

  if (ConceptLabels[data.$type] && ConceptLabels[data.$type].title) {
    return ConceptLabels[data.$type].title;
  }

  return data.$type;
}

export function insert(content, path: string, position: number | undefined, data: any) {
  const current = get(content, path, []);
  const insertAt = typeof position === 'undefined' ? current.length : position;
  current.splice(insertAt, 0, data);
  set(content, path, current);
  return content;
}

export function generateNewTrigger(data: TriggerFormData) {
  const optionalAttributes: { intent?: string; event?: string } = {};
  if (data.specifiedType) {
    data.$type = data.specifiedType;
  }
  if (data.intent) {
    optionalAttributes.intent = data.intent;
  }
  const newStep = {
    $type: data.$type,
    ...seedNewDialog(data.$type, {}, optionalAttributes),
  };
  return newStep;
}

export function generateRegexExpression(intent: string, pattern: string) {
  return { intent, pattern };
}

export function createTrigger(dialog: DialogInfo, data: TriggerFormData): DialogInfo {
  const dialogCopy = cloneDeep(dialog);
  const trigger = generateNewTrigger(data);
  insert(dialogCopy.content, 'triggers', undefined, trigger);
  return dialogCopy;
}

export function createRegExIntent(dialog: DialogInfo, intent: string, pattern: string): DialogInfo {
  const regex = generateRegexExpression(intent, pattern);
  const dialogCopy = cloneDeep(dialog);
  insert(dialogCopy.content, 'recognizer.intents', undefined, regex);
  return dialogCopy;
}

export function updateRegExIntent(dialog: DialogInfo, intent: string, pattern: string): DialogInfo {
  let dialogCopy = cloneDeep(dialog);
  const regexIntents = get(dialogCopy, 'content.recognizer.intents', []);
  const targetIntent = regexIntents.find(ri => ri.intent === intent);
  if (!targetIntent) {
    dialogCopy = createRegExIntent(dialog, intent, pattern);
  } else {
    targetIntent.pattern = pattern;
  }
  return dialogCopy;
}

//it is possible that we cannot find a RegEx. Because it will clear all regEx when we
//switch to another recognizer type
export function deleteRegExIntent(dialog: DialogInfo, intent: string): DialogInfo {
  const dialogCopy = cloneDeep(dialog);
  const regexIntents = get(dialogCopy, 'content.recognizer.intents', []);
  const index = regexIntents.findIndex(ri => ri.intent === intent);
  if (index > -1) {
    regexIntents.splice(index, 1);
  }
  return dialogCopy;
}

export function generateNewDialog(dialogs: DialogInfo[], dialogId: string, data: TriggerFormData): DialogInfo {
  //add new trigger
  const dialog = dialogs.find(dialog => dialog.id === dialogId);
  if (!dialog) throw new Error(`dialog ${dialogId} does not exist`);
  let updatedDialog = createTrigger(dialog, data);

  //add regex expression
  if (data.regexEx) {
    updatedDialog = createRegExIntent(updatedDialog, data.intent, data.regexEx);
  }
  return updatedDialog;
}

export function createSelectedPath(selected: number) {
  return `triggers[${selected}]`;
}

export function createFocusedPath(selected: number, focused: number) {
  return `triggers[${selected}].actions[${focused}]`;
}

export function deleteTrigger(dialogs: DialogInfo[], dialogId: string, index: number) {
  let dialogCopy = getDialog(dialogs, dialogId);
  if (!dialogCopy) return null;
  const isRegEx = get(dialogCopy, 'content.recognizer.$type', '') === regexRecognizerKey;
  if (isRegEx) {
    const regExIntent = get(dialogCopy, `content.triggers[${index}].intent`, '');
    dialogCopy = deleteRegExIntent(dialogCopy, regExIntent);
  }
  const triggers = get(dialogCopy, 'content.triggers');
  triggers.splice(index, 1);
  return dialogCopy.content;
}

export function getTriggerTypes(): IDropdownOption[] {
  const triggerTypes: IDropdownOption[] = [
    ...dialogGroups[DialogGroup.EVENTS].types.map(t => {
      let name = t as string;
      const labelOverrides = ConceptLabels[t];

      if (labelOverrides && labelOverrides.title) {
        name = labelOverrides.title;
      }

      return { key: t, text: name || t };
    }),
  ];
  return triggerTypes;
}

export function getEventTypes(): IDropdownOption[] {
  const eventTypes: IDropdownOption[] = [
    ...dialogGroups[DialogGroup.DIALOG_EVENT_TYPES].types.map(t => {
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
    ...dialogGroups[DialogGroup.ADVANCED_EVENTS].types.map(t => {
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

export function getMessageTypes(): IDropdownOption[] {
  const messageTypes: IDropdownOption[] = [
    ...dialogGroups[DialogGroup.MESSAGE_EVENTS].types.map(t => {
      let name = t as string;
      const labelOverrides = ConceptLabels[t];

      if (labelOverrides && labelOverrides.title) {
        name = labelOverrides.title;
      }

      return { key: t, text: name || t };
    }),
  ];
  return messageTypes;
}

export function getDialogsMap(dialogs: DialogInfo[]): DialogsMap {
  return dialogs.reduce((result, dialog) => {
    result[dialog.id] = dialog.content;
    return result;
  }, {});
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
    const dialog = dialogs.find(d => d.id === dialogId);
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
  const dialogsMapClone = cloneDeep(dialogsMap);
  const dialog = dialogsMapClone[dialogId];

  if (!dataPath) {
    return data;
  }
  return set(dialog, dataPath, data);
}

export function sanitizeDialogData(dialogData: any) {
  if (dialogData === null || dialogData === '') {
    return undefined;
  }

  if (Array.isArray(dialogData)) {
    return dialogData.length > 0 ? dialogData.map(sanitizeDialogData).filter(Boolean) : undefined;
  }

  if (typeof dialogData === 'object') {
    const obj = cloneDeep(dialogData); // Prevent mutation of source object.

    for (const key in obj) {
      if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
        delete obj[key];
        continue;
      }

      const result = sanitizeDialogData(obj[key]);
      switch (typeof result) {
        case 'undefined':
          delete obj[key];
          break;
        case 'boolean':
          obj[key] = result;
          break;
        case 'object':
          if (Object.keys(result).length === 0) {
            delete obj[key];
          } else {
            obj[key] = result;
          }
          break;
        default:
          obj[key] = result;
      }
    }

    if (Object.keys(obj).length === 0) {
      return undefined;
    }

    return obj;
  }

  return dialogData;
}

export function isExpression(str: string): boolean {
  try {
    ExpressionParser.parse(str);
  } catch (error) {
    return false;
  }

  return true;
}

export function getSelected(focused: string): string {
  if (!focused) return '';
  return focused.split('.')[0];
}

export function replaceDialogDiagnosticLabel(path?: string): string {
  if (!path) return '';
  let list = path.split('#');
  list = list.map(item => {
    return ConceptLabels[item]?.title || item;
  });
  return list.join(': ');
}
