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
 * sleep certain milliseconds.
 * @param ms Milliseconds of sleep time.
 */
export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
