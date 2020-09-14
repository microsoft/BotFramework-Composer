'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.useRecognizerConfig = void 0;
var tslib_1 = require('tslib');
var react_1 = require('react');
var extensionContext_1 = tslib_1.__importDefault(require('../extensionContext'));
function useRecognizerConfig() {
  var _a;
  var plugins = react_1.useContext(extensionContext_1.default).plugins;
  return (_a = plugins.recognizers) !== null && _a !== void 0 ? _a : [];
}
exports.useRecognizerConfig = useRecognizerConfig;
//# sourceMappingURL=useRecognizerConfig.js.map
