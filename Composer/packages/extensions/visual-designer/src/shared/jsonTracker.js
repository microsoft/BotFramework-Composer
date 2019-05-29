import { cloneDeep } from 'lodash';

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

function locateArrayInsertPoint(data, path) {
  const matchResult = path.match(/^(.+)\[(\d+)\]$/);
  if (!matchResult) {
    console.warn('insert checking failed: invalid path', path);
    return null;
  }

  const targetPath = matchResult[1];
  const targetIndex = parseInt(matchResult[2]);

  const targetArray = locateNode(data, targetPath).currentData;
  if (!Array.isArray(targetArray)) {
    console.warn('insert checking failed: invalid data, expect an array but got', targetArray);
    return null;
  }

  return {
    targetArray,
    targetIndex,
  };
}

export function insertBefore(inputDialog, path, $type) {
  const dialog = cloneDeep(inputDialog);
  const insertLocation = locateArrayInsertPoint(dialog, path);

  if (!insertLocation) {
    return dialog;
  }

  const { targetArray, targetIndex } = insertLocation;
  const newStep = { $type };
  targetArray.splice(targetIndex, 0, newStep);
  return dialog;
}

export function insertAfter(inputDialog, path, $type) {
  const dialog = cloneDeep(inputDialog);
  const insertLocation = locateArrayInsertPoint(dialog, path);

  if (!insertLocation) {
    return dialog;
  }

  const { targetArray, targetIndex } = insertLocation;
  const newStep = { $type };
  targetArray.splice(targetIndex + 1, 0, newStep);
  return dialog;
}
