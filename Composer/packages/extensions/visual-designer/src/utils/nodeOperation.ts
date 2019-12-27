// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function scrollNodeIntoView(selector: string) {
  const node: Element = document.querySelector(selector) as Element;
  node.scrollIntoView(true);
}
