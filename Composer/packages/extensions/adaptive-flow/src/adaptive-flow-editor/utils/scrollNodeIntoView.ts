// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function scrollNodeIntoView(selector: string) {
  const node = document.querySelector(selector);
  node?.scrollIntoView(true);
}
