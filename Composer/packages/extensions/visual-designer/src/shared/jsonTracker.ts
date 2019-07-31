import { cloneDeep, get, set } from 'lodash';
import nanoid from 'nanoid/generate';
import { seedNewDialog } from 'shared-menus';

import { getFriendlyName } from '../components/nodes/utils';

function locateNode(dialog: { [key: string]: any }, path) {
  if (!path) return null;

  const selectors = path.split('.');
  if (selectors.length === 0) {
    return null;
  }

  if (selectors[0] === '$') {
    selectors.shift();
  }

  // Locate the manipulated json node
  let parentData: object = {};
  let currentKey: number | string = '';
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

export function deleteNode(inputDialog, path, callbackOnRemovedData?: (removedData: any) => any) {
  const dialog = cloneDeep(inputDialog);
  const target = locateNode(dialog, path);
  if (!target) return dialog;

  const { parentData, currentData, currentKey } = target;

  const deletedData = cloneDeep(currentData);

  // Remove targetKey
  if (Array.isArray(parentData) && typeof currentKey === 'number') {
    parentData.splice(currentKey, 1);
  } else {
    delete parentData[currentKey];
  }

  // invoke callback handler
  if (callbackOnRemovedData && typeof callbackOnRemovedData === 'function') {
    callbackOnRemovedData(deletedData);
  }

  return dialog;
}

export function insert(inputDialog, path, position, $type) {
  const dialog = cloneDeep(inputDialog);
  const current = get(dialog, path, []);
  const newStep = {
    $type,
    $designer: {
      name: getFriendlyName({ $type }),
      id: nanoid('1234567890', 6),
    },
    ...seedNewDialog($type),
  };

  const insertAt = typeof position === 'undefined' ? current.length : position;

  current.splice(insertAt, 0, newStep);

  set(dialog, path, current);

  return dialog;
}

export function drop(inputDialog, targetId, targetPosition: number, source, isCopyMode: boolean) {
  if (!source || !targetId) return inputDialog;

  const { id: sourceId, data: sourceData } = source;
  if (sourceId === `${targetId}[${targetPosition}]` && !isCopyMode) return inputDialog;

  const dialog = cloneDeep(inputDialog);
  const sourceNode = locateNode(dialog, sourceId);
  if (sourceNode === null) return dialog;

  const targetArrayNode = locateNode(dialog, targetId);
  if (targetArrayNode === null) return dialog;

  // Insert new data to target point.
  targetArrayNode.currentData.splice(targetPosition, 0, sourceData);

  // Remove source data when is not copy mode.
  if (!isCopyMode) {
    sourceNode.currentData._deleted = true;
    if (Array.isArray(sourceNode.parentData)) {
      const oldDataIndex = sourceNode.parentData.findIndex(x => x._deleted);
      sourceNode.parentData.splice(oldDataIndex, 1);
    } else {
      delete sourceNode.parentData[sourceNode.currentKey];
    }
  }
  return dialog;
}
