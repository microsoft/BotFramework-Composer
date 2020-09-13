// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function scrollNodeIntoView(selector) {
  var node = document.querySelector(selector);
  if (!node) return;
  if (node.scrollIntoViewIfNeeded) {
    node.scrollIntoViewIfNeeded(true);
  } else {
    node.scrollIntoView(true);
  }
}
//# sourceMappingURL=scrollNodeIntoView.js.map
