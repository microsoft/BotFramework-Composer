import { cloneDeep, get, set } from 'lodash';

export const JSON_PATH_PREFIX = '$';

function locateNode(dialog, path) {
  if (!path) return null;

  const selectors = path.split('.');
  if (selectors.length === 0) {
    return null;
  }

  if (selectors[0] === '$') {
    selectors.shift();
  }

  // Locate the manipulated json node
  let parentData = null;
  let currentKey = null;
  let currentData = dialog;

  for (const selector of selectors) {
    let objSelector = selector;
    let arrayIndex;

    const parseResult = selector.match(/(\w+)\[(\d+)\]/);
    if (parseResult) {
      [, objSelector, arrayIndex] = parseResult;
      arrayIndex = parseInt(arrayIndex);
    }

    parentData = currentData;
    currentData = parentData[objSelector];
    currentKey = objSelector;

    if (arrayIndex !== undefined) {
      parentData = currentData;
      currentData = parentData[arrayIndex];
      currentKey = arrayIndex;
    }
  }

  return { parentData, currentData, currentKey };
}

export function deleteNode(inputDialog, path) {
  const dialog = cloneDeep(inputDialog);
  const target = locateNode(dialog, path);
  if (!target) return dialog;

  const { parentData, currentKey } = target;
  // Remove targetKey
  if (Array.isArray(parentData) && typeof currentKey === 'number') {
    parentData.splice(currentKey, 1);
  } else {
    delete parentData[currentKey];
  }

  return dialog;
}

const normalizePath = path => {
  if (path.startsWith(JSON_PATH_PREFIX)) return normalizePath(path.substr(1));
  if (path.startsWith('.')) return normalizePath(path.substr(1));
  return path;
};

export function insert(inputDialog, path, position, $type) {
  const dialog = cloneDeep(inputDialog);
  const normalizedPath = normalizePath(path);
  const current = get(dialog, normalizedPath, []);
  const newStep = { $type };

  const insertAt = typeof position === 'undefined' ? current.length : position;

  current.splice(insertAt, 0, newStep);

  set(dialog, normalizedPath, current);

  return dialog;
}
