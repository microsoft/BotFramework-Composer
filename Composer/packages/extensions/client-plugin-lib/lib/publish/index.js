"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../common/constants");
function setPublishConfig(config) {
    window[constants_1.ComposerGlobalName].setPublishConfig(config);
}
exports.setPublishConfig = setPublishConfig;
function setConfigIsValid(valid) {
    window[constants_1.ComposerGlobalName].setConfigIsValid(valid);
}
exports.setConfigIsValid = setConfigIsValid;
function useConfigBeingEdited() {
    return window[constants_1.ComposerGlobalName].useConfigBeingEdited();
}
exports.useConfigBeingEdited = useConfigBeingEdited;
//# sourceMappingURL=index.js.map