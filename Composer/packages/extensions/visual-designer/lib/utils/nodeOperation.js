// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function scrollNodeIntoView(selector) {
  var node = document.querySelector(selector);
  node === null || node === void 0 ? void 0 : node.scrollIntoView(true);
}
//# sourceMappingURL=nodeOperation.js.map
