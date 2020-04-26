// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import has from 'lodash/has';
import get from 'lodash/get';
import set from 'lodash/set';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

import { JsonWalk, VisitorFunc } from '../utils/jsonWalk';

import { ListDiff } from './listDiff';

export interface IJSONChangeAdd {
  path: string;
  value: any;
}
export interface IJSONChangeDelete {
  path: string;
  value: any;
}
export interface IJSONChangeUpdate {
  path: string;
  value: any;
  preValue: any;
}

export interface IJsonChanges {
  adds: IJSONChangeAdd[];
  deletes: IJSONChangeDelete[];
  updates: IJSONChangeUpdate[];
}

export type IDiffer = (
  json1: any,
  json2: any,
  path: string,
  stopper: IStopper
) => { isChange: boolean; isStop: boolean };
export type IStopper = (json1: any, json2: any, path: string) => boolean;

export const JsonPathStart = '$';

export function jsonPathToObjectPath(path: string) {
  // eslint-disable-next-line security/detect-non-literal-regexp
  const reg = new RegExp(`^\\${JsonPathStart}\\.`);
  return path.replace(reg, '');
}
export function getWithJsonPath(value, path) {
  if (path === JsonPathStart) return value;
  const objPath = jsonPathToObjectPath(path);
  return get(value, objPath);
}
export function hasWithJsonPath(value, path) {
  if (path === JsonPathStart) return true;
  const objPath = jsonPathToObjectPath(path);
  return has(value, objPath);
}

/**
 *
 * @param json1
 * @param json2
 * @param path
 * compare json2 to json1 json at path should stop walk
 * case 1: they both are object walk-able value, same type, e.g. {}, {a:1} -> false,
 * case 2: they are not same type, e.g. {}, [] -> true
 * case 3: one of them is non-walk-able type, e.g. 1, {} -> true
 * TODO:
 * case 4: both are array, [], [] -> listDiff
 */
export const defualtJSONStopComparison: IStopper = (json1: any, json2: any, path: string) => {
  const value1 = getWithJsonPath(json1, path);
  const value2 = getWithJsonPath(json2, path);
  if (typeof value1 !== 'object' || typeof value2 !== 'object') return true; // case 3
  if (Array.isArray(value1) !== Array.isArray(value2)) return true; // case 2
  return false;
};

// compare json2 to json1 at path is an add.
export const defaultJSONAddDiffer: IDiffer = (json1: any, json2: any, path: string, stopper: IStopper) => {
  const isChange = hasWithJsonPath(json1, path) === false && hasWithJsonPath(json2, path) === true;
  const isStop = isChange || stopper(json1, json2, path);
  return { isChange, isStop };
};

// compare json2 to json1 at path is an update.
export const defaultJSONUpdateDiffer: IDiffer = (json1: any, json2: any, path: string, stopper: IStopper) => {
  const value1 = getWithJsonPath(json1, path);
  const value2 = getWithJsonPath(json2, path);

  const isStop = stopper(json1, json2, path);
  // _isEqual comparison use http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero
  const isChange = isStop && hasWithJsonPath(json1, path) && hasWithJsonPath(json2, path) && !isEqual(value1, value2);
  return { isChange, isStop };
};

export function JsonDiffAdds(prevJson, currJson, differ?: IDiffer, stopper?: IStopper): IJSONChangeAdd[] {
  const results: IJSONChangeAdd[] = [];

  const usedDiffer = differ || defaultJSONAddDiffer;
  const usedStopper = stopper || defualtJSONStopComparison;
  const visitor: VisitorFunc = (path, value) => {
    // if both value are array, pass to ListDiffer
    const value1 = getWithJsonPath(prevJson, path);
    const value2 = getWithJsonPath(currJson, path);
    if (Array.isArray(value1) && Array.isArray(value2)) {
      const listChanges = ListDiff(value1, value2, usedDiffer, usedStopper).adds.map(item => {
        item.path = `${path}${item.path}`;
        return item;
      });
      results.push(...listChanges);
      return true;
    } else {
      const { isChange, isStop } = usedDiffer(prevJson, currJson, path, usedStopper);
      if (isChange) {
        results.push({ path, value });
      }
      if (isStop) {
        return true;
      }
    }

    return false;
  };

  JsonWalk(JsonPathStart, currJson, visitor);
  return results;
}

export function JsonDiffDeletes(prevJson, currJson, differ?: IDiffer, stopper?: IStopper): IJSONChangeDelete[] {
  return JsonDiffAdds(currJson, prevJson, differ, stopper);
}

export function JsonDiffUpdates(prevJson, currJson, differ?: IDiffer, stopper?: IStopper): IJSONChangeUpdate[] {
  const results: IJSONChangeUpdate[] = [];
  const usedDiffer = differ || defaultJSONUpdateDiffer;
  const usedStopper = stopper || defualtJSONStopComparison;

  const visitor: VisitorFunc = (path, value) => {
    // if both value are array, pass to ListDiffer
    const value1 = getWithJsonPath(prevJson, path);
    const value2 = getWithJsonPath(currJson, path);
    if (Array.isArray(value1) && Array.isArray(value2)) {
      const listChanges = ListDiff(value1, value2, usedDiffer, usedStopper).updates.map(item => {
        item.path = `${path}${item.path}`;
        return item;
      });
      results.push(...listChanges);
      return true;
    } else {
      const { isChange, isStop } = usedDiffer(prevJson, currJson, path, usedStopper);
      if (isChange) {
        const preValue = getWithJsonPath(prevJson, path);
        results.push({ path, preValue, value });
      }
      if (isStop) {
        return true;
      }
    }

    return false;
  };

  JsonWalk(JsonPathStart, currJson, visitor);
  return results;
}

/**
 * Why both need JsonDiff & ListDiff ?
 *
 * 1. Diff an object with key (path), compararion happens inside this key field.
 * if key `add` or `delete`, absolutely a change happen on this key (path).
 * if key is same, compare this key's right value would know it's an `update` or not.
 *
 * 2. Diff a list with key like [0],[1], comparation may happen cross it's siblings
 * if key '[4]' is added, and list.length + 1, it's a simple `add` change.
 * if key '[4]' is deleted, and list.length - 1, it's a delete happens somewhere, to figure out where, we need compararion cross all list item.
 * if all key is same, which means list.length is same, the fact probably be `update on [1] & add on [5] & delete on [0]` .
 *
 * @param prevJson {[key:string]: any}
 * @param currJson
 * @param differ
 * @param stopper
 */
export function JsonDiff(prevJson, currJson, differ?: IDiffer, stopper?: IStopper): IJsonChanges {
  return {
    adds: JsonDiffAdds(prevJson, currJson, differ, stopper),
    deletes: JsonDiffDeletes(prevJson, currJson, differ, stopper),
    updates: JsonDiffUpdates(prevJson, currJson, differ, stopper),
  };
}

/**
 * Utils
 */

export function JsonSet(origin: any, updates: { path: string; value: any }[]) {
  return updates.reduce((origin, currentItem) => {
    const { path, value } = currentItem;
    return set(origin, path, value);
  }, cloneDeep(origin));
}

export function JsonInsert(origin: any, updates: { path: string; value: any }[]) {
  return updates.reduce((origin, currentItem) => {
    const { path, value } = currentItem;
    const matched = path.match(/(.*)\[(\d+)\]$/);
    if (!matched) throw new Error('insert path must in an array, e.g [1]');
    const [, insertListPath, insertIndex] = matched;
    const insertListValue = insertListPath ? get(origin, insertListPath) : origin;
    if (!Array.isArray(insertListValue)) throw new Error('insert target path value is not an array');

    insertListValue.splice(Number(insertIndex), 0, value);
    return insertListPath ? set(origin, insertListPath, insertListValue) : insertListValue;
  }, cloneDeep(origin));
}
