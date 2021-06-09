// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Searches an array of strings using the index of with logic; finds the
 * strings that have the needle as a sub string.
 *
 * This function can be reduced in logic when we can induce T[K] type
 * as a string.
 *
 * @param haystack The items to search.
 * @param needle The query to search with.
 * @param keyParam An optional key param if T was an object.
 * @param search An optional special search function.
 * @returns The items where the search key parameter has the needle as a substring.
 */
export const substringSearchStrategy = <T, K extends keyof T>(
  haystack: T[],
  needle: string,
  keyParam?: K,
  searchFn?: (item: T, query: string) => boolean
): T[] => {
  const query = (needle || '').toLocaleLowerCase();

  return haystack.filter((hay) => {
    if (searchFn) {
      return searchFn(hay, query);
    }

    const value = keyParam ? hay[keyParam] : hay;

    if (typeof value === 'string') {
      return value.toLocaleLowerCase().indexOf(query) !== -1;
    }

    return false;
  });
};
