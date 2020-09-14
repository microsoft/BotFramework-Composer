'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.checkIsOutside = void 0;
exports.checkIsOutside = function (x, y, element) {
  var _a = element.getBoundingClientRect(),
    left = _a.left,
    top = _a.top,
    right = _a.right,
    bottom = _a.bottom;
  return x < left || x > right || y < top || y > bottom;
};
//# sourceMappingURL=uiUtils.js.map
