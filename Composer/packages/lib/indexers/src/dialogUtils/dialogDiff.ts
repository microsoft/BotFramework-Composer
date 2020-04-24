// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * not like JsonDiff, DialogDiff compaire stop at { $kind, $id, ... }
 * The atomic unit to add/delete/update is a dialog object {}
 */

/**
 * TODO:
 * 1. array.insert()
 *    ['a','b','c'] -> ['x','a','b','c']  is an add at $0, not updates at [$0, $1, $2] + add at $3
 *
 * To figure out changes on a array { actions/triggers... }, $designer.id can be used as diff mark.
 *
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
  IDiffer,
  IStopper,
  defaultJSONAddDiffer,
  defualtJSONStopComparison,
  getWithJsonPath,
  hasWithJsonPath,
} from './jsonDiff';

function isDialogObject(value: any): boolean {
  return typeof value === 'object' && has(value, '$kind');
}

export function isSameDesignerIdDialogObject(value1: any, value2: any): boolean {
  return (
    typeof value1 === 'object' &&
    typeof value2 === 'object' &&
    get(value1, '$designer.id') === get(value2, '$designer.id')
  );
}

export function isSameKind(value1: any, value2: any): boolean {
  return typeof value1 === 'object' && typeof value2 === 'object' && get(value1, '$kind') === get(value2, '$kind');
}

function isSkipDialogObject(value1: any, value2: any): boolean {
  const skipKinds = [SDKKinds.AdaptiveDialog, SDKKinds.OnUnknownIntent];
  const kind1 = get(value1, '$kind');
  const kind2 = get(value2, '$kind');
  return skipKinds.includes(kind1) || skipKinds.includes(kind2);
}

function isSameType(value1, value2) {
  if (typeof value1 !== 'object' || typeof value2 !== 'object') return false;
  return Array.isArray(value1) === Array.isArray(value2);
}

// define json walk stop point.
export const defualtDialogStopComparison: IStopper = (json1: any, json2: any, path: string) => {
  const value1 = getWithJsonPath(json1, path);
  const value2 = getWithJsonPath(json2, path);
  return !isSameType(value1, value2) || defualtJSONStopComparison(json1, json2, path);
};

// define json2 compare to json1 at path is an add.
export const defaultDialogAddDiffer: IDiffer = (json1: any, json2: any, path: string, stopper: IStopper) => {
  return defaultJSONAddDiffer(json1, json2, path, stopper);
};

// define json2 compare to json1 at path is an update.
export const defaultDialogUpdateDiffer: IDiffer = (json1: any, json2: any, path: string, stopper: IStopper) => {
  const value1 = getWithJsonPath(json1, path);
  const value2 = getWithJsonPath(json2, path);
  const isChange =
    hasWithJsonPath(json1, path) &&
    hasWithJsonPath(json2, path) &&
    isDialogObject(value1) &&
    isDialogObject(value2) &&
    !isSkipDialogObject(value1, value2) &&
    (!isSameKind(value1, value2) || !isEqual(value1, value2));
  const isStop = isChange || stopper(json1, json2, path);
  return { isChange, isStop };
};

/**
 *
 * @param prevJson , previous json value
 * @param currJson , current json value
 * @param differ , the diff function used to compare tow value, decide it's a 'add' or not, hasNot in prevJson && has in currJson is the most common comparision function.
 * @param stopper , stop function tell JsonWalk what is the leaf, most small comparision unit. for AdaptiveDialog is { $kind, ...no-child }
 */

export function DialogDiffAdd(prevJson, currJson, differ?: IDiffer, stopper?: IStopper): IJSONChangeAdd[] {
  const usedDiffer = differ || defaultDialogAddDiffer;
  const usedStopper = stopper || defualtDialogStopComparison;
  return JsonDiffAdds(prevJson, currJson, usedDiffer, usedStopper);
}

export function DialogDiffDelete(prevJson, currJson, differ?: IDiffer, stopper?: IStopper): IJSONChangeDelete[] {
  return DialogDiffAdd(currJson, prevJson, differ, stopper);
}

export function DialogDiffUpdate(prevJson, currJson, differ?: IDiffer, stopper?: IStopper): IJSONChangeUpdate[] {
  const usedDiffer = differ || defaultDialogUpdateDiffer;
  const usedStopper = stopper || defualtDialogStopComparison;
  return JsonDiffUpdates(prevJson, currJson, usedDiffer, usedStopper);
}

export function DialogDiff(prevJson, currJson, differ?: IDiffer, stopper?: IStopper): IJsonChanges {
  return {
    adds: DialogDiffAdd(prevJson, currJson, differ, stopper),
    deletes: DialogDiffDelete(prevJson, currJson, differ, stopper),
    updates: DialogDiffUpdate(prevJson, currJson, differ, stopper),
  };
}
