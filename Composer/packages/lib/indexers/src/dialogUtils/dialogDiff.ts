// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import has from 'lodash/has';
import get from 'lodash/get';

import { JsonWalk, VisitorFunc } from '../utils/jsonWalk';

function jsonPathToLodashPath(path: string) {
  return path.replace(/^\$\./, '');
}

interface IJsonChanges {
  adds: { path: string; value: any }[];
  deletes: { path: string; value: any }[];
  updates: { path: string; value: any; preValue: any }[];
}

export function JsonDiff(prevJson, currJson): IJsonChanges {
  const changes: IJsonChanges = {
    adds: [],
    deletes: [],
    updates: [],
  };
  const addnUpdateVisitor: VisitorFunc = (path, value) => {
    if (path === '$') return false;
    const _path = jsonPathToLodashPath(path);
    const preValue = get(prevJson, _path);
    if (has(prevJson, _path) === false) {
      changes.adds.push({ path: _path, value });
      return true;
    } else if (typeof preValue !== 'object' || typeof value !== 'object') {
      if (preValue !== value) {
        changes.updates.push({ path: _path, preValue, value });
      }
      return true;
    }

    return false;
  };

  const deleteVisitor: VisitorFunc = (path, value) => {
    if (path === '$') return false;
    const _path = jsonPathToLodashPath(path);
    if (has(currJson, _path) === false) {
      changes.deletes.push({ path: _path, value });
      return true;
    }
    return false;
  };

  JsonWalk('$', currJson, addnUpdateVisitor);
  JsonWalk('$', prevJson, deleteVisitor);

  return changes;
}
