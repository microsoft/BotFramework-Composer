import { cloneDeep, get, set } from 'lodash';
import nanoid from 'nanoid/generate';
import { seedNewDialog } from 'shared-menus';

import { getFriendlyName } from '../components/nodes/utils';

function locateNode(dialog: { [key: string]: any }, path: string) {
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

  // Locate the manipulated json node
  let parentData: object = {};
  let currentKey: number | string = '';
  let currentData = dialog;

  for (const selector of normalizedSelectors) {
    parentData = currentData;
    currentData = parentData[selector];
    currentKey = selector;

    if (currentData === undefined) return null;
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

export function copyNodes(inputDialog, nodeIds: string[]): any[] {
  const nodes = nodeIds.map(id => queryNode(inputDialog, id)).filter(x => x !== null);
  return JSON.parse(JSON.stringify(nodes));
}

export function cutNodes(inputDialog, nodeIds: string[]) {
  const dialog = cloneDeep(inputDialog);
  const nodesData = copyNodes(dialog, nodeIds);

  const nodeLocations = nodeIds.map(id => locateNode(dialog, id));
  nodeLocations.forEach(location => {
    if (!location || !Array.isArray(location.parentData)) return;
    location.parentData[location.currentKey] = null;
  });

  nodeLocations.forEach(location => {
    if (!location || !Array.isArray(location.parentData)) return;
    for (let i = location.parentData.length - 1; i >= 0; i--) {
      if (location.parentData[i] === null) location.parentData.splice(i, 1);
    }
  });

  return { dialog, cutData: nodesData };
}

export function appendNodesAfter(inputDialog, targetId, newNodes) {
  if (!Array.isArray(newNodes) || newNodes.length === 0) {
    return inputDialog;
  }

  const dialog = cloneDeep(inputDialog);
  const prevNode = locateNode(dialog, targetId);

  if (!prevNode || !Array.isArray(prevNode.parentData)) {
    return inputDialog;
  }

  prevNode.parentData.splice(parseInt(prevNode.currentKey as string) + 1, 0, ...newNodes);
  return dialog;
}

export function pasteNodes(inputDialog, targetPath, targetIndex, newNodes) {
  if (!Array.isArray(newNodes) || newNodes.length === 0) {
    return inputDialog;
  }

  const dialog = cloneDeep(inputDialog);
  const targetArray = locateNode(dialog, targetPath);

  if (!targetArray || !Array.isArray(targetArray.currentData)) {
    return inputDialog;
  }

  targetArray.currentData.splice(targetIndex, 0, ...newNodes);
  return dialog;
}
