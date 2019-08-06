import { get, set, cloneDeep, replace } from 'lodash';
import { ConceptLabels } from 'shared-menus';
import { ExpressionEngine } from 'botbuilder-expression-parser';
import formatMessage from 'format-message';

import { upperCaseName } from './fileUtil';

const ExpressionParser = new ExpressionEngine();

export function getDialogName(path) {
  const realPath = replace(path, '#.', '#');
  const [dialogName] = realPath.split('#');

  return dialogName;
}

export function getDialogsMap(dialogs) {
  return dialogs.reduce((result, dialog) => {
    result[dialog.id] = dialog.content;
    return result;
  }, {});
}

export function getbreadcrumbLabel(dialogs, dialogId, dataPath, focused) {
  let label = '';
  if (!dataPath && !focused) {
    label = dialogs.find(d => d.id === dialogId).displayName;
  } else {
    let current = `${dataPath || ''}.${focused || ''}.$type`;
    if (!dataPath) {
      current = replace(current, '.', '');
    }
    if (!focused) {
      current = replace(current, '..', '.');
    }
    const dialogsMap = getDialogsMap(dialogs);
    const dialog = dialogsMap[dialogId];
    label = get(dialog, current);
  }

  label = formatMessage(upperCaseName(label));
  return label;
}

export function getDialogData(dialogsMap, path) {
  if (path === '') return '';
  const realPath = replace(path, '#.', '#');
  const pathList = realPath.split('#');
  const dialog = dialogsMap[pathList[0]];

  if (pathList[1] === '') {
    return dialog;
  }

  return ConceptLabels[get(dialog, pathList[1])]
    ? ConceptLabels[get(dialog, pathList[1])].title
    : get(dialog, pathList[1]);
}

export function setDialogData(dialogsMap, path, data) {
  const dialogsMapClone = cloneDeep(dialogsMap);
  const realPath = replace(path, '#.', '#');
  const pathList = realPath.split('#');
  const dialog = dialogsMapClone[pathList[0]];

  if (pathList[1] === '') {
    return data;
  }
  return set(dialog, pathList[1], data);
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
