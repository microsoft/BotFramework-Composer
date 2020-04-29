// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * not like JsonDiff, DialogDiff compaire stop at { $kind, $id, ... }
 * The atomic unit to add/delete/update is a dialog object {}
 */

import has from 'lodash/has';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { SDKKinds } from '@bfc/shared';

import {
  JsonDiffAdds,
  JsonDiffUpdates,
  IJsonChanges,
  IJSONChangeAdd,
  IJSONChangeDelete,
  IJSONChangeUpdate,
  IComparator,
  IStopper,
  defualtJSONStopComparison,
  getWithJsonPath,
} from './jsonDiff';

interface DialogObject {
  $kind: SDKKinds;
  $designer?: {
    id: string | number;
  };
}

// function isDialogObject(value: any): boolean {
//   return typeof value === 'object' && has(value, '$kind');
// }

/**
 *
 * @param value1
 * @param value2
 * if both have $designer.id, they must be same.
 */
export function isSameDesignerId(value1: DialogObject, value2: DialogObject): boolean {
  if (has(value1, '$designer.id') === false && has(value2, '$designer.id') === false) return true;
  return get(value1, '$designer.id') === get(value2, '$designer.id');
}

/**
 *
 * @param value1
 * @param value2
 *  if both have $kind, they must be same.
 */
export function isSameKind(value1: DialogObject, value2: DialogObject): boolean {
  if (has(value1, '$kind') === false && has(value2, '$kind') === false) return true;
  return get(value1, '$kind') === get(value2, '$kind');
}

// function isSkipDialogObject(value1: DialogObject, value2: DialogObject): boolean {
//   const skipKinds = [SDKKinds.AdaptiveDialog, SDKKinds.OnUnknownIntent];
//   const kind1 = get(value1, '$kind');
//   const kind2 = get(value2, '$kind');
//   return skipKinds.includes(kind1) || skipKinds.includes(kind2);
// }

export function isSameType(value1, value2) {
  if (typeof value1 !== 'object' || typeof value2 !== 'object') return false;
  return Array.isArray(value1) === Array.isArray(value2);
}

/**
 *
 * @param json1
 * @param json2
 * @param path
 * stop function tell JsonWalk what is the leaf, most small comparision unit. for AdaptiveDialog is { $kind, ...no-child }
 * compare json2 to json1 json at path should stop walk
 * case 1: extend default json stop comparision.
 * case 2: not same $kind type
 * case 3: not same $designer.id, if exist
 */
export const defualtDialogStopComparison: IStopper = (json1: any, json2: any, path: string) => {
  const value1 = getWithJsonPath(json1, path);
  const value2 = getWithJsonPath(json2, path);
  return (
    !isSameKind(value1, value2) || !isSameDesignerId(value1, value2) || defualtJSONStopComparison(json1, json2, path)
  );
};

// compare json2 to json1 at path is an update.
export const defaultDialogUpdateComparator: IComparator = (json1: any, json2: any, path: string) => {
  const value1 = getWithJsonPath(json1, path);
  const value2 = getWithJsonPath(json2, path);

  const isChange = !isEqual(value1, value2);
  const isStop = defualtDialogStopComparison(json1, json2, path);
  return { isChange, isStop };
};

/**
 *
 * @param prevJson , previous json value
 * @param currJson , current json value
 * @param comparator , the compare function used to compare tow value, decide it's a 'add' or not, hasNot in prevJson && has in currJson is the most common comparision function.
 */

export function DialogDiffAdd(prevJson, currJson): IJSONChangeAdd[] {
  return JsonDiffAdds(prevJson, currJson);
}

export function DialogDiffDelete(prevJson, currJson): IJSONChangeDelete[] {
  return DialogDiffAdd(currJson, prevJson);
}

export function DialogDiffUpdate(prevJson, currJson, comparator?: IComparator): IJSONChangeUpdate[] {
  const usedComparator = comparator || defaultDialogUpdateComparator;
  return JsonDiffUpdates(prevJson, currJson, usedComparator);
}

export function DialogDiff(prevJson, currJson, comparator?: IComparator): IJsonChanges {
  return {
    adds: DialogDiffAdd(prevJson, currJson),
    deletes: DialogDiffDelete(prevJson, currJson),
    updates: DialogDiffUpdate(prevJson, currJson, comparator),
  };
}
