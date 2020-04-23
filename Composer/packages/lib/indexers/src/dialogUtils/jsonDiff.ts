// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import has from 'lodash/has';
import get from 'lodash/get';

import { JsonWalk, VisitorFunc } from '../utils/jsonWalk';

interface IJSONChangeAdd {
  path: string;
  value: any;
}
interface IJSONChangeDelete {
  path: string;
  value: any;
}
interface IJSONChangeUpdate {
  path: string;
  value: any;
  preValue: any;
}

export interface IJsonChanges {
  adds: IJSONChangeAdd[];
  deletes: IJSONChangeDelete[];
  updates: IJSONChangeUpdate[];
}

export type IDiffer = (json1, json2, path: string) => boolean;
export type IStopper = (value1, value2) => boolean;

export const JsonPathStart = '$';

// TODO:
/**
 * TODO:
 * 1. array.insert()
 *   [1,2,3] -> [0,1,2,3]
 *   is an add at [0];
 *
 */

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
 * @param value1
 * @param value2
 *
 * {}, {a:1} false
 * {}, []    true
 * 1, {}     true
 * 'a', 'a'  true
 */

// define json walk stop point
export const defualtJSONStopComparison: IStopper = (value1: any, value2: any) => {
  if (typeof value1 !== 'object' || typeof value2 !== 'object') return true;
  if (Array.isArray(value1) && !Array.isArray(value2)) return true;
  if (Array.isArray(value2) && !Array.isArray(value1)) return true;
  return false;
};

// define json2 compare to json1 at path is an add.
export const defaultJSONAddDiffer: IDiffer = (json1: any, json2: any, path: string) => {
  return hasWithJsonPath(json1, path) === false && hasWithJsonPath(json2, path) === true;
};

// define json2 compare to json1 at path is an update.
export const defaultJSONUpdateDiffer: IDiffer = (json1: any, json2: any, path: string) => {
  const value1 = getWithJsonPath(json1, path);
  const value2 = getWithJsonPath(json2, path);
  return hasWithJsonPath(json1, path) === true && value1 !== value2 && defualtJSONStopComparison(value1, value2);
};

export function JsonDiffAdds(prevJson, currJson, differ?: IDiffer, stopper?: IStopper): IJSONChangeAdd[] {
  const results: IJSONChangeAdd[] = [];

  const usedDiffer = differ || defaultJSONAddDiffer;
  const usedStopper = stopper || defualtJSONStopComparison;
  const visitor: VisitorFunc = (path, value) => {
    const preValue = getWithJsonPath(prevJson, path);
    if (usedDiffer(prevJson, currJson, path)) {
      results.push({ path, value });
      return true;
    }
    if (usedStopper(preValue, value)) {
      return true;
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
    const preValue = getWithJsonPath(prevJson, path);
    if (usedDiffer(prevJson, currJson, path)) {
      results.push({ path, preValue, value });
      return true;
    }
    if (usedStopper(preValue, value)) {
      return true;
    }
    return false;
  };

  JsonWalk(JsonPathStart, currJson, visitor);
  return results;
}

export function JsonDiff(prevJson, currJson): IJsonChanges {
  return {
    adds: JsonDiffAdds(prevJson, currJson),
    deletes: JsonDiffDeletes(prevJson, currJson),
    updates: JsonDiffUpdates(prevJson, currJson),
  };
}
