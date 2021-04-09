// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * To assert the http response is successful.
 * @param code Http response status code.
 * @returns If the http call is successful.
 */
export function isSuccessful(code: number) {
  return code >= 200 && code < 400;
}

/**
 * Get publish file string from env.
 * @returns Publish file string content.
 */
export function getPublishProfile(): Record<string, unknown> {
  const publishFile = process.env.DAILY_CI_PUBLISH_FILE;
  if (!publishFile) {
    throw Error('Could not find publish file.');
  }

  return JSON.parse(publishFile.trim());
}

/**
 * sleep certain milliseconds.
 * @param ms Milliseconds of sleep time.
 */
export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
