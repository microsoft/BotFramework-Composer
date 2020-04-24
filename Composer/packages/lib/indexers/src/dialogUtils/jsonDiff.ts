// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import has from 'lodash/has';
import get from 'lodash/get';

import { JsonWalk, VisitorFunc } from '../utils/jsonWalk';

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
  const isChange = isStop && hasWithJsonPath(json1, path) && hasWithJsonPath(json2, path) && value1 !== value2;
  return { isChange, isStop };
};

export function JsonDiffAdds(prevJson, currJson, differ?: IDiffer, stopper?: IStopper): IJSONChangeAdd[] {
  const results: IJSONChangeAdd[] = [];

  const usedDiffer = differ || defaultJSONAddDiffer;
  const usedStopper = stopper || defualtJSONStopComparison;
  const visitor: VisitorFunc = (path, value) => {
    const { isChange, isStop } = usedDiffer(prevJson, currJson, path, usedStopper);
    if (isChange) {
      results.push({ path, value });
    }
    if (isStop) {
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
    const { isChange, isStop } = usedDiffer(prevJson, currJson, path, usedStopper);
    if (isChange) {
      const preValue = getWithJsonPath(prevJson, path);
      results.push({ path, preValue, value });
    }
    if (isStop) {
      return true;
    }
    return false;
  };

  JsonWalk(JsonPathStart, currJson, visitor);
  return results;
}

export function JsonDiff(prevJson, currJson, differ?: IDiffer, stopper?: IStopper): IJsonChanges {
  return {
    adds: JsonDiffAdds(prevJson, currJson, differ, stopper),
    deletes: JsonDiffDeletes(prevJson, currJson, differ, stopper),
    updates: JsonDiffUpdates(prevJson, currJson, differ, stopper),
  };
}
