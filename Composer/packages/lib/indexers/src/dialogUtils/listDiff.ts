// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import isEqual from 'lodash/isEqual';
import intersectionBy from 'lodash/intersectionBy';
import differenceWith from 'lodash/differenceWith';
// import xorWith from 'lodash/xorWith';
import indexOf from 'lodash/indexOf';
// import pullAllWith from 'lodash/pullAllWith';

import { IJsonChanges, IJSONChangeAdd, IJSONChangeDelete, IJSONChangeUpdate, IDiffer, IStopper } from './jsonDiff';

/**
 * diff with listItem's change
 * @param list1 any[]
 * @param list2
 *
 * Compare two list with comparator, find out {adds, deletes, updates}
 *
 * 1. Basic value:
 * ['a','b','c'] vs ['a','b','x']
 * ==> update: {[2]: 'c'->'x'}
 * ['a','b','c'] vs ['x','a','b','c']
 * ==> add: {[0]: 'x'}
 *
 * 2. Object value diffrent by :
 * [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]  vs [{ id: 1, name: 'a' }, { id: 11, name: 'aa' }, { id: 2, name: 'b' }]
 * ==> add: {[1]: { id: 11, name: 'aa' }}
 */

/**
 * diff with key
 * Assume list1, list2 both are uniqed list.
 * @param list1 {[key:string]: any}
 * @param list2
 * @param differ
 * @param stopper
 */
export function ListDiff(list1: any[], list2: any[], differ?: IDiffer, stopper?: IStopper): IJsonChanges {
  const usedDiffer = isEqual;
  const list1Changes = differenceWith(list1, list2, usedDiffer).map(item => {
    return {
      index: indexOf(list1, item),
      value: item,
    };
  }); // list1[index] item are not found in list2
  const list2Changes = differenceWith(list2, list1, usedDiffer).map(item => {
    return {
      index: indexOf(list2, item),
      value: item,
    };
  }); // list2[index] item are not found in list1

  // same index's change are should be an `update`.
  const updateChanges = intersectionBy(list2Changes, list1Changes, 'index');
  const updateChangesIndex = updateChanges.map(({ index }) => index);
  // pull out changes already included by `updates`
  const deleteChanges = list1Changes.filter(({ index }) => !updateChangesIndex.includes(index));
  const addChanges = list2Changes.filter(({ index }) => !updateChangesIndex.includes(index));

  // format outputs
  const adds = addChanges.map(({ index, value }) => {
    return {
      path: `[${index}]`,
      value,
    };
  });
  const deletes = deleteChanges.map(({ index, value }) => {
    return {
      path: `[${index}]`,
      value,
    };
  });
  const updates = updateChanges.map(({ index, value }) => {
    const preValue = list1[index];
    return {
      path: `[${index}]`,
      value,
      preValue,
    };
  });
  return {
    adds,
    deletes,
    updates,
  };
}
