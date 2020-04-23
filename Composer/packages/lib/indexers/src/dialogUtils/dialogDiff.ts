// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
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

// TODO:
/**
 * TODO:
 * 1. array.insert()
 *   [1,2,3] -> [0,1,2,3]
 *   is an add at [0];
 * To figure out changes on a array { actions/triggers... }
 *
 */

/**
 * not like JsonDiff, DialogDiff compaire stop at { $kind, $id, ... }
 * add {}
 * delete {}
 * update { activity }, pass this to json diff, get property changes.
 */

function isDialogObject(value: any): boolean {
  return typeof value === 'object' && has(value, '$kind');
}

export function isSameDesignerId(value1: any, value2: any): boolean {
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

// define dialog walk stop point
export const defualtDialogStopComparison: IStopper = (value1: any, value2: any) => {
  return !isSameType(value1, value2) || defualtJSONStopComparison(value1, value2);
};

// define json2 compare to json1 at path is an add.
export const defaultDialogAddDiffer: IDiffer = (json1: any, json2: any, path: string) => {
  return defaultJSONAddDiffer(json1, json2, path);
};
// define json2 compare to json1 at path is an add.
export const defaultDialogUpdateDiffer: IDiffer = (json1: any, json2: any, path: string) => {
  const value1 = getWithJsonPath(json1, path);
  const value2 = getWithJsonPath(json2, path);

  return (
    hasWithJsonPath(json1, path) &&
    hasWithJsonPath(json2, path) &&
    isDialogObject(value1) &&
    isDialogObject(value2) &&
    !isSkipDialogObject(value1, value2) &&
    (!isSameKind(value1, value2) || !isEqual(value1, value2))
  );
};

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
