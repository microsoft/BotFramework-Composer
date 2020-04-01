// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type Compare<T> = (one: T, two: T) => number;

export const isSorted = <T>(items: ReadonlyArray<T>, compare: Compare<T>): boolean => {
  for (let index = 0; index + 1 < items.length; ++index) {
    const one = items[index + 0];
    const two = items[index + 1];
    if (compare(one, two) > 0) {
      return false;
    }
  }

  return true;
};

export const deepEquals = (one: unknown, two: unknown): boolean => {
  const same = Object.is(one, two);
  if (same) {
    return true;
  } else if (Array.isArray(one) && Array.isArray(two)) {
    const countOne = one.length;
    const countTwo = two.length;

    if (countOne !== countTwo) {
      return false;
    }

    for (let index = 0; index < countOne; ++index) {
      const itemOne = one[index];
      const itemTwo = two[index];
      if (!deepEquals(itemOne, itemTwo)) {
        return false;
      }
    }

    return true;
  } else if (typeof one === 'object' && one !== null && typeof two === 'object' && two != null) {
    const namesOne = Object.getOwnPropertyNames(one);
    const namesTwo = Object.getOwnPropertyNames(two);

    const countOne = namesOne.length;
    const countTwo = namesTwo.length;

    if (countOne !== countTwo) {
      return false;
    }

    for (let index = 0; index < countOne; ++index) {
      const name = namesOne[index];
      if (!deepEquals(one[name], two[name])) {
        return false;
      }
    }

    return true;
  } else {
    return same;
  }
};
