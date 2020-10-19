"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonWalk = void 0;
/**
 *
 * @param path jsonPath string
 * @param value current node value
 * @param visitor
 */
exports.JsonWalk = (path, value, visitor) => {
    const stop = visitor(path, value);
    if (stop === true)
        return;
    // extract array
    if (Array.isArray(value)) {
        value.forEach((child, index) => {
            exports.JsonWalk(`${path}[${index}]`, child, visitor);
        });
        // extract object
    }
    else if (typeof value === 'object' && value) {
        Object.keys(value).forEach((key) => {
            exports.JsonWalk(`${path}.${key}`, value[key], visitor);
        });
    }
};
//# sourceMappingURL=jsonWalk.js.map