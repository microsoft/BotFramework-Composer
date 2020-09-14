'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useShellApi = void 0;
var tslib_1 = require('tslib');
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var react_1 = require('react');
var extensionContext_1 = tslib_1.__importDefault(require('../extensionContext'));
function useShellApi() {
  var _a = react_1.useContext(extensionContext_1.default),
    shellApi = _a.shellApi,
    shellData = _a.shellData,
    plugins = _a.plugins;
  if (!shellApi) {
    // eslint-disable-next-line no-console
    console.error(new Error('No ShellApi in Extension Context!'));
    return {};
  }
  if (!shellData) {
    // eslint-disable-next-line no-console
    console.error(new Error('No ShellData in Extension Context!'));
    return {};
  }
  return tslib_1.__assign({ shellApi: shellApi, plugins: plugins }, shellData);
}
exports.useShellApi = useShellApi;
//# sourceMappingURL=useShellApi.js.map
