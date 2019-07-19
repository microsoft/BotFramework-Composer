import { cloneDeep, get, set } from 'lodash';
import nanoid from 'nanoid/generate';

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

export function deleteNode(inputDialog, path, removeLgTemplate) {
  const dialog = cloneDeep(inputDialog);
  const target = locateNode(dialog, path);
  if (!target) return dialog;

  const { parentData, currentData, currentKey } = target;
  if (currentData.$type === 'Microsoft.SendActivity') {
    if (currentData.activity && currentData.activity.indexOf('[bfdactivity-') !== -1) {
      removeLgTemplate('common', currentData.activity.slice(1, currentData.activity.length - 1));
    }
  }

  // Remove targetKey
  if (Array.isArray(parentData) && typeof currentKey === 'number') {
    parentData.splice(currentKey, 1);
  } else {
    delete parentData[currentKey];
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
  };

  const insertAt = typeof position === 'undefined' ? current.length : position;

  current.splice(insertAt, 0, newStep);

  set(dialog, path, current);

  return dialog;
}
