import get from 'lodash.get';
import set from 'lodash.set';
import cloneDeep from 'lodash.clonedeep';

export function getRootDialogName(dialogsMap, path) {
  return Object.keys(dialogsMap).find(d => path.startsWith(d));
}

export function getDialogData(dialogsMap, path) {
  if (path === '') return '';
  const pathList = path.split('#');
  const dialog = dialogsMap[pathList[0]];

  if (pathList[1] === '') {
    return dialog;
  }

  return get(dialog, pathList[1]);
}

export function setDialogData(dialogsMap, path, data) {
  const dialogsMapClone = cloneDeep(dialogsMap);
  const pathList = path.split('#');
  const dialog = dialogsMapClone[pathList[0]];

  if (pathList[1] === '') {
    return data;
  }
  return set(dialog, pathList[1], data);
}
