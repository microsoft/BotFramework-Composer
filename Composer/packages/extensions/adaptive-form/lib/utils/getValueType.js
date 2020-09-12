"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValueType = void 0;
var tslib_1 = require("tslib");
var isNumber_1 = tslib_1.__importDefault(require("lodash/isNumber"));
/**
 * Returns JSON Schema type for given value.
 */
function getValueType(value) {
    if (Array.isArray(value)) {
        return 'array';
    }
    if (isNumber_1.default(value)) {
        return Number.isInteger(value) ? 'integer' : 'number';
    }
    return typeof value;
}
exports.getValueType = getValueType;
//# sourceMappingURL=getValueType.js.map