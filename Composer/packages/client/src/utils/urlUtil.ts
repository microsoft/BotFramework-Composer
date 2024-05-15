// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* Returns true if the url is different than the local domain. */
export const isExternalLink = (url: string): boolean => {
  const { origin } = location;
  const parsedUrl = new URL(url, origin);
  return parsedUrl.origin !== origin;
};
