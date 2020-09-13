'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useDebounce = void 0;
var tslib_1 = require('tslib');
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var react_1 = require('react');
var debounce_1 = tslib_1.__importDefault(require('lodash/debounce'));
exports.useDebounce = function (fn, options) {
  return react_1.useMemo(
    function () {
      return debounce_1.default(fn, options);
    },
    [fn]
  );
};
//# sourceMappingURL=useDebounce.js.map
