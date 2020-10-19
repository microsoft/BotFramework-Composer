"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseName = exports.getExtension = void 0;
function getExtension(filename) {
    if (typeof filename !== 'string')
        return filename;
    return filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
}
exports.getExtension = getExtension;
function getBaseName(filename, sep) {
    if (sep)
        return filename.substr(0, filename.lastIndexOf(sep));
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
}
exports.getBaseName = getBaseName;
//# sourceMappingURL=fileUtil.js.map