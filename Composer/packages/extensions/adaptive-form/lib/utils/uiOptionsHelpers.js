"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUiPlaceholder = exports.getUiDescription = exports.getUiLabel = void 0;
var tslib_1 = require("tslib");
var startCase_1 = tslib_1.__importDefault(require("lodash/startCase"));
function getUiLabel(props) {
    var uiOptions = props.uiOptions, schema = props.schema, name = props.name, value = props.value, label = props.label;
    if (label === false) {
        return false;
    }
    var uiLabel = uiOptions.label;
    if (uiLabel) {
        return typeof uiLabel === 'function' ? uiLabel(value) : uiLabel;
    }
    else if (uiLabel === false) {
        return false;
    }
    return label || (schema === null || schema === void 0 ? void 0 : schema.title) || startCase_1.default(name);
}
exports.getUiLabel = getUiLabel;
function getUiDescription(props) {
    var uiOptions = props.uiOptions, schema = props.schema, value = props.value, description = props.description;
    var uiDescription = uiOptions.description;
    if (uiDescription) {
        return typeof uiDescription === 'function' ? uiDescription(value) : uiDescription;
    }
    return description || (schema === null || schema === void 0 ? void 0 : schema.description);
}
exports.getUiDescription = getUiDescription;
function getUiPlaceholder(props) {
    var uiOptions = props.uiOptions, schema = props.schema, value = props.value, placeholder = props.placeholder;
    var uiPlaceholder = uiOptions.placeholder;
    var fieldUIPlaceholder = '';
    if (uiPlaceholder) {
        fieldUIPlaceholder = typeof uiPlaceholder === 'function' ? uiPlaceholder(value) : uiPlaceholder;
    }
    else if (placeholder) {
        fieldUIPlaceholder = placeholder;
    }
    else if (schema && Array.isArray(schema.examples) && schema.examples.length > 0) {
        fieldUIPlaceholder = "ex. " + schema.examples.join(', ');
    }
    if (fieldUIPlaceholder && schema.pattern) {
        var regex_1 = "" + schema.pattern;
        var placeholderExamples = fieldUIPlaceholder.split(',').map(function (example) { return example.trim(); });
        var filteredExamples = placeholderExamples.filter(function (example) { return example.match(regex_1); });
        fieldUIPlaceholder = filteredExamples.join(', ');
    }
    return fieldUIPlaceholder !== '' ? fieldUIPlaceholder : undefined;
}
exports.getUiPlaceholder = getUiPlaceholder;
//# sourceMappingURL=uiOptionsHelpers.js.map