// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import isEqual from 'lodash/isEqual';
import intersectionBy from 'lodash/intersectionBy';
import differenceWith from 'lodash/differenceWith';
// import xorWith from 'lodash/xorWith';
import indexOf from 'lodash/indexOf';
// import pullAllWith from 'lodash/pullAllWith';

import { IJsonChanges, IComparator, JsonDiff, IJSONChangeUpdate, defualtJSONStopComparison } from './jsonDiff';

// updates in N level list, may be an add/delete/update in N+1 level
// continue walk in current list.
export function deconstructChangesInListUpdateChanges(
  updates: IJSONChangeUpdate[],
  comparator?: IComparator
): IJsonChanges {
  const results: IJsonChanges = {
    adds: [],
    deletes: [],
    updates: [],
  };

  const fixedUpdates: IJSONChangeUpdate[] = [];
  for (let index = 0; index < updates.length; index++) {
    const item = updates[index];
    const { preValue, value } = item;
    if (comparator ? comparator(preValue, value, '$').isStop : defualtJSONStopComparison(preValue, value, '$')) {
      // it's an end level change, no need to walk in.
      fixedUpdates.push(item);
      continue;
    }

    const changes = JsonDiff(preValue, value, comparator);

    // // if real change happens in low level, pull it out
    // if (changes.adds.length || changes.deletes.length || changes.updates.length) {
    //   fixedUpdates.splice(index, 1);
    // }

    // contine walk in
    const changesInUpdates = deconstructChangesInListUpdateChanges(changes.updates, comparator);

    const adds = [...changes.adds, ...changesInUpdates.adds].map(subItem => {
      subItem.path = `${item.path}${subItem.path.replace(/^\$/, '')}`;
      return subItem;
    });
    const deletes = [...changes.deletes, ...changesInUpdates.deletes].map(subItem => {
      subItem.path = `${item.path}${subItem.path.replace(/^\$/, '')}`;
      return subItem;
    });

    const updates2 = changesInUpdates.updates.map(subItem => {
      subItem.path = `${item.path}${subItem.path.replace(/^\$/, '')}`;
      return subItem;
    });

    results.adds.push(...adds);
    results.deletes.push(...deletes);
    fixedUpdates.push(...updates2);
  }

  results.updates = fixedUpdates;

  return results;
}

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
 * @param comparator // value comparator
 */
export function ListDiff(list1: any[], list2: any[], comparator?: IComparator): IJsonChanges {
  const usedComparator = (item1, item2): boolean => {
    if (comparator) {
      return !comparator(item1, item2, '$').isChange;
    } else {
      return isEqual(item1, item2);
    }
  };

  // difference comparator is an updated comparator
  const list1Changes = differenceWith(list1, list2, usedComparator).map(item => {
    return {
      index: indexOf(list1, item),
      value: item,
    };
  }); // list1[index] item are not found in list2
  const list2Changes = differenceWith(list2, list1, usedComparator).map(item => {
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

  const changesInUpdates = deconstructChangesInListUpdateChanges(updates, comparator);

  return {
    adds: adds.concat(changesInUpdates.adds),
    deletes: deletes.concat(changesInUpdates.deletes),
    updates: changesInUpdates.updates,
  };
}
