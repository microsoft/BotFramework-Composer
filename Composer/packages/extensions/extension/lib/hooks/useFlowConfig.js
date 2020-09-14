'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.useFlowConfig = void 0;
var tslib_1 = require('tslib');
var react_1 = require('react');
var mapValues_1 = tslib_1.__importDefault(require('lodash/mapValues'));
var extensionContext_1 = tslib_1.__importDefault(require('../extensionContext'));
function useFlowConfig() {
  var plugins = react_1.useContext(extensionContext_1.default).plugins;
  var config = react_1.useMemo(
    function () {
      return mapValues_1.default(plugins.uiSchema, 'flow');
    },
    [plugins.uiSchema]
  );
  return config;
}
exports.useFlowConfig = useFlowConfig;
//# sourceMappingURL=useFlowConfig.js.map
