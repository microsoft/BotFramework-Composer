"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergePluginConfigs = void 0;
var tslib_1 = require("tslib");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var mergeWith_1 = tslib_1.__importDefault(require("lodash/mergeWith"));
var isArray_1 = tslib_1.__importDefault(require("lodash/isArray"));
var mergeArrays = function (objValue, srcValue, key) {
    if (isArray_1.default(objValue)) {
        // merge recognizers into defaults
        if (key === 'recognizers') {
            return srcValue.concat(objValue);
        }
        // otherwise override other arrays
        return srcValue;
    }
};
var defaultPlugin = {
    uiSchema: {},
    recognizers: [],
    flowWidgets: {},
};
function mergePluginConfigs() {
    var plugins = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        plugins[_i] = arguments[_i];
    }
    return mergeWith_1.default.apply(void 0, tslib_1.__spreadArrays([{}, defaultPlugin], plugins, [mergeArrays]));
}
exports.mergePluginConfigs = mergePluginConfigs;
//# sourceMappingURL=mergePluginConfigs.js.map