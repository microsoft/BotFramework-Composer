'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.isPropertyHidden = exports.getHiddenProperties = exports.globalHiddenProperties = void 0;
var tslib_1 = require('tslib');
exports.globalHiddenProperties = ['$kind', '$id', '$copy', '$designer', 'id', 'disabled'];
exports.getHiddenProperties = function (uiOptions, value) {
  var hiddenProperties = typeof uiOptions.hidden === 'function' ? uiOptions.hidden(value) : uiOptions.hidden || [];
  return new Set(tslib_1.__spreadArrays(exports.globalHiddenProperties, hiddenProperties));
};
exports.isPropertyHidden = function (uiOptions, value, property) {
  return exports.getHiddenProperties(uiOptions, value).has(property);
};
//# sourceMappingURL=getHiddenProperties.js.map
