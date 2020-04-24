// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import isEqual from 'lodash/isEqual';
import intersectionBy from 'lodash/intersectionBy';
import xorWith from 'lodash/xorWith';
import indexOf from 'lodash/indexOf';

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
  const allChanges = xorWith(list1, list2, isEqual);

  const deleteChanges: any[] = [];
  const addChanges: any[] = [];
  // split changes to adds & deletes
  allChanges.forEach(item => {
    const list1Index = indexOf(list1, item);
    const list2Index = indexOf(list2, item);
    if (list1Index !== -1) {
      deleteChanges.push({
        index: list1Index,
        value: item,
      });
    } else if (list2Index !== -1) {
      addChanges.push({
        index: list2Index,
        value: item,
      });
    }
  });

  const intersectionChanges = intersectionBy(addChanges, addChanges, 'index');
  // same path add & delete is update
  const updates: IJSONChangeUpdate[] = intersectionChanges
    .map(({ index, value }) => {
      const preValue = list1[index];
      return {
        path: `[${index}]`,
        preValue,
        value,
      };
    })
    .filter(({ preValue }) => !!preValue);

  const updateChangesIndex = updates.map(({ path }) => path);

  // pull out updates from adds/deletes
  const adds: IJSONChangeAdd[] = addChanges
    .filter(({ index }) => !updateChangesIndex.includes(`[${index}]`))
    .map(({ index, value }) => {
      return {
        path: `[${index}]`,
        value,
      };
    });
  const deletes: IJSONChangeDelete[] = deleteChanges
    .filter(({ index }) => !updateChangesIndex.includes(`[${index}]`))
    .map(({ index, value }) => {
      return {
        path: `[${index}]`,
        value,
      };
    });

  return {
    adds,
    deletes,
    updates,
  };
}
