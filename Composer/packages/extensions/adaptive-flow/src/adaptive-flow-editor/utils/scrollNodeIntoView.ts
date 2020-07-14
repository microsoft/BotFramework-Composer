// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function scrollNodeIntoView(selector: string) {
  const node = document.querySelector(selector);
  if (!node) return;

  if ((node as any).scrollIntoViewIfNeeded) {
    (node as any).scrollIntoViewIfNeeded(true);
  } else {
    node.scrollIntoView(true);
  }
}
