import get from 'lodash.get';
import set from 'lodash.set';

export function getRootDialogName(dialogsMap, path) {
  return Object.keys(dialogsMap).find(d => path.startsWith(d));
}

export function getDialogData(dialogsMap, path) {
  return get(dialogsMap, path);
}

export function setDialogData(dialogsMap, path, data) {
  return set(dialogsMap, path, data);
}
