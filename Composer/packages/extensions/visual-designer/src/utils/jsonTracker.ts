/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { cloneDeep, get, set } from 'lodash';
import { seedNewDialog, deepCopyAction } from 'shared';

import { getFriendlyName } from '../components/nodes/utils';

function parseSelector(path: string): null | string[] {
  if (!path) return null;

  const selectors = path.split('.');
  if (selectors.length === 0) {
    return null;
  }

  if (selectors[0] === '$' || selectors[0] === '') {
    selectors.shift();
  }

  const normalizedSelectors = selectors.reduce(
    (result, selector) => {
      // e.g. actions[0]
      const parseResult = /(\w+)\[(\d+)\]/.exec(selector);

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

  // Locate the to be manipulated json node
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

/**
 * The difference between `prepareNode` and `locateNode` is,
 * `prepareNode` will create new container to make sure your path is always valid.
 */
function prepareTargetArray(dialog: { [key: string]: any }, arrayPath: string) {
  const selectors = parseSelector(arrayPath);
  if (!Array.isArray(selectors)) return null;
  if (selectors.length === 0) return { parentData: null, currentKey: null, currentData: dialog };

  // Locate the manipulated json node
  let parentData: object = {};
  let currentKey: number | string = '';
  let currentData = dialog;

  for (const selector of selectors) {
    parentData = currentData;
    currentData = parentData[selector];
    currentKey = selector;

    if (currentData === undefined) {
      // lodash.set will create `[ null ]` which is not expected.
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

export function deleteNodes(inputDialog, nodeIds: string[], callbackOnRemovedData?: (removedData: any) => any) {
  const dialog = cloneDeep(inputDialog);

  const nodeLocations = nodeIds.map(id => locateNode(dialog, id));
  const deletedNodes: any[] = [];

  // mark deletion
  nodeLocations.forEach(location => {
    if (!location) return;
    deletedNodes.push(location.currentData);

    if (Array.isArray(location.parentData)) {
      location.parentData[location.currentKey] = null;
    } else {
      delete location.parentData[location.currentKey];
    }
  });

  // delete empty slots in array
  nodeLocations.forEach(location => {
    if (!location || !Array.isArray(location.parentData)) return;
    for (let i = location.parentData.length - 1; i >= 0; i--) {
      if (location.parentData[i] === null) location.parentData.splice(i, 1);
    }
  });

  // invoke callback handler
  if (callbackOnRemovedData && typeof callbackOnRemovedData === 'function') {
    deletedNodes.forEach(x => callbackOnRemovedData(x));
  }

  return dialog;
}

export function insert(inputDialog, path, position, $type) {
  const dialog = cloneDeep(inputDialog);
  const current = get(dialog, path, []);
  const newStep = {
    $type,
    ...seedNewDialog($type, { name: getFriendlyName({ $type }) }),
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
  const nodesData = copyNodes(inputDialog, nodeIds);
  const newDialog = deleteNodes(inputDialog, nodeIds);

  return { dialog: newDialog, cutData: nodesData };
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

export async function pasteNodes(inputDialog, arrayPath, arrayIndex, newNodes, lgApi) {
  if (!Array.isArray(newNodes) || newNodes.length === 0) {
    return inputDialog;
  }

  const dialog = cloneDeep(inputDialog);
  const targetArray = prepareTargetArray(dialog, arrayPath);

  if (!targetArray || !Array.isArray(targetArray.currentData)) {
    return inputDialog;
  }

  // NOTES: underlying lg api for writing new lg template to file is not concurrency-safe,
  //        so we have to call them sequentially
  // TODO: copy them parralleled via Promise.all() after optimizing lg api.
  const copiedNodes: any[] = [];
  for (const node of newNodes) {
    // Deep copy nodes with external resources
    const copy = await deepCopyAction(node, lgApi);
    copiedNodes.push(copy);
  }

  targetArray.currentData.splice(arrayIndex, 0, ...copiedNodes);
  return dialog;
}
