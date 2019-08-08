import { cloneDeep, get, set } from 'lodash';
import nanoid from 'nanoid/generate';
import { seedNewDialog } from 'shared-menus';

import { getFriendlyName } from '../components/nodes/utils';

function parseSelector(path: string): null | string[] {
  if (!path) return null;

  const selectors = path.split('.');
  if (selectors.length === 0) {
    return null;
  }

  if (selectors[0] === '$') {
    selectors.shift();
  }

  const normalizedSelectors = selectors.reduce(
    (result, selector) => {
      // e.g. steps[0]
      const parseResult = selector.match(/(\w+)\[(\d+)\]/);

      if (parseResult) {
        const [, objSelector, arraySelector] = parseResult;
        const arrayIndex = parseInt(arraySelector);
        result.push(objSelector, arrayIndex);
      } else {
        result.push(selector);
      }

      return result;
    },
    [] as any[]
  );

  return normalizedSelectors;
}

function locateNode(dialog: { [key: string]: any }, path: string) {
  const selectors = parseSelector(path);
  if (!Array.isArray(selectors)) return null;
  if (selectors.length === 0) return dialog;

  // Locate the manipulated json node
  let parentData: object = {};
  let currentKey: number | string = '';
  let currentData = dialog;

  for (const selector of selectors) {
    parentData = currentData;
    currentData = parentData[selector];
    currentKey = selector;

    if (currentData === undefined) return null;
  }

  return { parentData, currentData, currentKey };
}

function prepareNode(dialog: { [key: string]: any }, path: string) {
  const selectors = parseSelector(path);
  if (!Array.isArray(selectors)) return null;
  if (selectors.length === 0) return dialog;

  // Locate the manipulated json node
  let parentData: object = {};
  let currentKey: number | string = '';
  let currentData = dialog;

  for (const selector of selectors) {
    parentData = currentData;
    currentData = parentData[selector];
    currentKey = selector;

    if (currentData === undefined) {
      currentData = [];
      parentData[currentKey] = currentData;
    }
  }

  return { parentData, currentData, currentKey };
}

export function queryNode(inputDialog, path) {
  const target = locateNode(inputDialog, path);
  if (!target) return null;

  return target.currentData;
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
  const newStep = {
    $type,
    $designer: {
      name: getFriendlyName({ $type }),
      id: nanoid('1234567890', 6),
    },
    ...seedNewDialog($type),
  };

  return insertStep(inputDialog, path, position, newStep);
}

export function insertStep(inputDialog, path, position, newStep) {
  const dialog = cloneDeep(inputDialog);
  const current = get(dialog, path, []);

  const insertAt = typeof position === 'undefined' ? current.length : position;

  current.splice(insertAt, 0, newStep);

  set(dialog, path, current);

  return dialog;
}

export function drop(inputDialog, targetId, targetPosition: number, source, isCopyMode: boolean) {
  if (!source || !targetId) return inputDialog;

  const { id: sourcePath, data: sourceData } = source;
  const targetPath = `${targetId}[${targetPosition}]`;
  // Forbid the case that drop a node to itself or its child under non-copy mode.
  if (targetPath.indexOf(sourcePath) === 0 && !isCopyMode) return inputDialog;

  const dialog = cloneDeep(inputDialog);
  const sourceNode = locateNode(dialog, sourcePath);
  if (sourceNode === null) return dialog;

  const targetArrayNode = prepareNode(dialog, targetId);
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
