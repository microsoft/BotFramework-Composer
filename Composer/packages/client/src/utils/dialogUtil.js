import { get, set, cloneDeep, replace } from 'lodash';

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
