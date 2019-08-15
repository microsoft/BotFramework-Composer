import { get, set, cloneDeep } from 'lodash';
import { ConceptLabels } from 'shared-menus';
import { ExpressionEngine } from 'botbuilder-expression-parser';
import formatMessage from 'format-message';

import { upperCaseName } from './fileUtil';
import { getFocusPath } from './navigation';

const ExpressionParser = new ExpressionEngine();

export function getDialogsMap(dialogs) {
  return dialogs.reduce((result, dialog) => {
    result[dialog.id] = dialog.content;
    return result;
  }, {});
}

const getTitle = (editorSchema, type) => {
  const sdkOverrides = get(editorSchema, ['content', 'SDKOverrides', type]);

  return (sdkOverrides && sdkOverrides.title) || '';
};

export function getbreadcrumbLabel(dialogs, dialogId, focusedEvent, focusedSteps, schemas) {
  let label = '';
  const dataPath = getFocusPath(focusedEvent, focusedSteps[0]);
  if (!dataPath) {
    const dialog = dialogs.find(d => d.id === dialogId);
    label = (dialog && dialog.displayName) || '';
  } else {
    const current = `${dataPath}.$type`;
    const dialogsMap = getDialogsMap(dialogs);
    const dialog = dialogsMap[dialogId];
    const type = get(dialog, current);
    label = getTitle(schemas.editor, type);
  }

  label = formatMessage(upperCaseName(label || ''));
  return label;
}

export function getDialogData(dialogsMap, dialogId, dataPath = '') {
  if (!dialogId) return '';
  const dialog = dialogsMap[dialogId];

  if (!dataPath) {
    return dialog;
  }

  return ConceptLabels[get(dialog, dataPath)] ? ConceptLabels[get(dialog, dataPath)].title : get(dialog, dataPath);
}

export function setDialogData(dialogsMap, dialogId, dataPath, data) {
  const dialogsMapClone = cloneDeep(dialogsMap);
  const dialog = dialogsMapClone[dialogId];

  if (!dataPath) {
    return data;
  }
  return set(dialog, dataPath, data);
}

export function sanitizeDialogData(dialogData) {
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

export function isExpression(str) {
  try {
    ExpressionParser.parse(str);
  } catch (error) {
    return false;
  }

  return true;
}
