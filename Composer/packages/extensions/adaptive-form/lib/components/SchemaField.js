"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaField = exports.SchemaField = void 0;
var tslib_1 = require("tslib");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
var core_1 = require("@emotion/core");
var react_1 = require("react");
var extension_1 = require("@bfc/extension");
var utils_1 = require("../utils");
var ErrorMessage_1 = require("./ErrorMessage");
var schemaField = {
    container: function (depth) {
        if (depth === void 0) { depth = 0; }
        return core_1.css(templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["\n    display: flex;\n    flex-direction: column;\n    margin: 10px ", "px;\n\n    label: SchemaFieldContainer;\n  "], ["\n    display: flex;\n    flex-direction: column;\n    margin: 10px ", "px;\n\n    label: SchemaFieldContainer;\n  "])), depth === 0 ? 18 : 0);
    },
};
exports.schemaField = schemaField;
var SchemaField = function (props) {
    var _a;
    var className = props.className, definitions = props.definitions, name = props.name, baseSchema = props.schema, _b = props.uiOptions, baseUIOptions = _b === void 0 ? {} : _b, value = props.value, rawErrors = props.rawErrors, hideError = props.hideError, hidden = props.hidden, onChange = props.onChange, rest = tslib_1.__rest(props, ["className", "definitions", "name", "schema", "uiOptions", "value", "rawErrors", "hideError", "hidden", "onChange"]);
    var formUIOptions = extension_1.useFormConfig();
    var schema = utils_1.resolveRef(baseSchema, definitions);
    var uiOptions = tslib_1.__assign(tslib_1.__assign({}, utils_1.getUIOptions(schema, formUIOptions)), baseUIOptions);
    var handleChange = function (newValue) {
        var _a;
        var serializedValue = typeof ((_a = uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.serializer) === null || _a === void 0 ? void 0 : _a.set) === 'function' ? uiOptions.serializer.set(newValue) : newValue;
        onChange(serializedValue);
    };
    react_1.useEffect(function () {
        if (typeof value === 'undefined') {
            if (schema.const) {
                handleChange(schema.const);
            }
            else if (schema.default) {
                handleChange(schema.default);
            }
        }
    }, []);
    if (name.startsWith('$') || hidden) {
        return null;
    }
    var error = typeof rawErrors === 'string' && (core_1.jsx(ErrorMessage_1.ErrorMessage, { error: rawErrors, helpLink: uiOptions.helpLink, label: utils_1.getUiLabel(props) }));
    var deserializedValue = typeof ((_a = uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.serializer) === null || _a === void 0 ? void 0 : _a.get) === 'function' ? uiOptions.serializer.get(value) : value;
    var FieldWidget = utils_1.resolveFieldWidget(schema, uiOptions, formUIOptions);
    var fieldProps = tslib_1.__assign(tslib_1.__assign({}, rest), { definitions: definitions, description: utils_1.getUiDescription(tslib_1.__assign(tslib_1.__assign({}, props), { uiOptions: uiOptions })), enumOptions: schema.enum, error: error || undefined, label: utils_1.getUiLabel(tslib_1.__assign(tslib_1.__assign({}, props), { uiOptions: uiOptions })), name: name, onChange: handleChange, placeholder: utils_1.getUiPlaceholder(tslib_1.__assign(tslib_1.__assign({}, props), { uiOptions: uiOptions })), rawErrors: typeof (rawErrors === null || rawErrors === void 0 ? void 0 : rawErrors[name]) === 'object' ? rawErrors === null || rawErrors === void 0 ? void 0 : rawErrors[name] : rawErrors, schema: schema,
        uiOptions: uiOptions, value: deserializedValue });
    return (core_1.jsx("div", { className: className, css: schemaField.container(props.depth) },
        core_1.jsx(FieldWidget, tslib_1.__assign({}, fieldProps)),
        !hideError && !uiOptions.hideError && error));
};
exports.SchemaField = SchemaField;
exports.default = SchemaField;
var templateObject_1;
//# sourceMappingURL=SchemaField.js.map