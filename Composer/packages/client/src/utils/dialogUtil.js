import get from 'lodash.get';
import set from 'lodash.set';
import cloneDeep from 'lodash.clonedeep';

export function getRootDialogName(dialogsMap, path) {
  return Object.keys(dialogsMap).find(d => path.startsWith(d));
}

export function getDialogData(dialogsMap, path) {
  // if path is a top level name, return the whole dialog
  if (dialogsMap.hasOwnProperty(path)) {
    return dialogsMap[path];
  }

  const dialog = getRootDialogName(dialogsMap, path);
  const data = dialogsMap[dialog];
  const subPath = path.replace(`${dialog}.`, '');

  return get(data, subPath);
}

export function setDialogData(dialogsMap, path, data) {
  const dialogsMapClone = cloneDeep(dialogsMap);

  if (dialogsMapClone.hasOwnProperty(path)) {
    return set(dialogsMapClone, path, data);
  }

  const dialog = getRootDialogName(dialogsMapClone, path);
  const dialogData = dialogsMapClone[dialog];
  const subPath = path.replace(`${dialog}.`, '');

  return set(dialogData, subPath, data);
}
