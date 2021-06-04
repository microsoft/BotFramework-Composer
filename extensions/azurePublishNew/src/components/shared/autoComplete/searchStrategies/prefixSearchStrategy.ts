// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Copyright (c) Microsoft. All rights reserved.
 */

/**
 * Searches an array of strings using the starts with logic; finds the
 * strings that start with the needle.
 *
 * This function can be reduced in logic when we can induce T[K] type
 * as a string.
 *
 * @param haystack The items to search.
 * @param needle The query to search with.
 * @returns The items where the search key parameter starts with the needle.
 */
export const prefixSearchStrategy = <T, K extends keyof T>(haystack: T[], needle: string, keyParam: K): T[] => {
  const query = (needle || '').toLocaleLowerCase();

  return haystack.filter((hay) => {
    const value = hay[keyParam];

    if (typeof value === 'string') {
      return value.toLocaleLowerCase().startsWith(query);
    }

    return false;
  });
};
