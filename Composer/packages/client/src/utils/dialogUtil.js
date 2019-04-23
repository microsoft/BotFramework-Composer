import get from 'lodash.get';

export function getDialogData(dialogsMap, path) {
  // if path is a top level name, return the whole dialog
  if (dialogsMap.hasOwnProperty(path)) {
    return dialogsMap[path];
  }

  const dialog = Object.keys(dialogsMap).find(d => path.startsWith(d));
  const data = dialogsMap[dialog];
  const subPath = path.replace(`${dialog}.`, '');

  return get(data, subPath);
}
