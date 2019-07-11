import { get, set, cloneDeep, replace, has } from 'lodash';

import { JsonWalk } from './jsonWalk';

export function getDialogName(path) {
  const realPath = replace(path, '#.', '#');
  const [dialogName] = realPath.split('#');

  return dialogName;
}

export function getDialogData(dialogsMap, path) {
  if (path === '') return '';
  const realPath = replace(path, '#.', '#');
  const pathList = realPath.split('#');
  const dialog = dialogsMap[pathList[0]];

  if (pathList[1] === '') {
    return dialog;
  }

  return get(dialog, pathList[1]);
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
