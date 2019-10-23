import { ConceptLabels, DialogGroup, SDKTypes, dialogGroups, seedNewDialog } from 'shared';
import { cloneDeep, get, set } from 'lodash';
import { ExpressionEngine } from 'botbuilder-expression-parser';
import { IDropdownOption } from 'office-ui-fabric-react';
import { DialogInfo } from 'shared';

import { getFocusPath } from './navigation';
import { upperCaseName } from './fileUtil';

const ExpressionParser = new ExpressionEngine();

interface DialogsMap {
  [dialogId: string]: any;
}

export interface TriggerFormData {
  errors: TriggerFormDataErrors;
  $type: string;
  intent: string;
  specifiedType: string;
}

export interface TriggerFormDataErrors {
  $type?: string;
  intent?: string;
  specifiedType?: string;
}

export function getDialog(dialogs: DialogInfo[], dialogId: string) {
  const dialog = dialogs.find(item => item.id === dialogId);
  return cloneDeep(dialog);
}

export const eventTypeKey: string = SDKTypes.OnDialogEvent;
export const intentTypeKey: string = SDKTypes.OnIntent;
export const activityTypeKey: string = SDKTypes.OnActivity;

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

export function insert(content, path: string, position: number | undefined, data: TriggerFormData) {
  const current = get(content, path, []);
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

  const insertAt = typeof position === 'undefined' ? current.length : position;

  current.splice(insertAt, 0, newStep);

  set(content, path, current);

  return content;
}

export function addNewTrigger(dialogs: DialogInfo[], dialogId: string, data: TriggerFormData): DialogInfo {
  const dialogCopy = getDialog(dialogs, dialogId);
  if (!dialogCopy) throw new Error(`dialog ${dialogId} does not exist`);
  insert(dialogCopy.content, 'triggers', undefined, data);
  return dialogCopy;
}

export function createSelectedPath(selected: number) {
  return `triggers[${selected}]`;
}

export function createFocusedPath(selected: number, focused: number) {
  return `triggers[${selected}].actions[${focused}]`;
}

export function deleteTrigger(dialogs: DialogInfo[], dialogId: string, index: number) {
  const dialogCopy = getDialog(dialogs, dialogId);
  if (!dialogCopy) return null;
  const content = dialogCopy.content;
  content.triggers.splice(index, 1);
  return content;
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
        name = labelOverrides.title;
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
        name = labelOverrides.title;
      }

      return { key: t, text: name || t };
    }),
  ];
  return activityTypes;
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
