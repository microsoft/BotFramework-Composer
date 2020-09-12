"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormRow = exports.getRowProps = void 0;
var tslib_1 = require("tslib");
var core_1 = require("@emotion/core");
var utils_1 = require("../utils");
var SchemaField_1 = require("./SchemaField");
exports.getRowProps = function (rowProps, field) {
    var _a, _b;
    var id = rowProps.id, depth = rowProps.depth, schema = rowProps.schema, definitions = rowProps.definitions, value = rowProps.value, uiOptions = rowProps.uiOptions, transparentBorder = rowProps.transparentBorder, className = rowProps.className, label = rowProps.label, rawErrors = rowProps.rawErrors, onBlur = rowProps.onBlur, onFocus = rowProps.onFocus, onChange = rowProps.onChange;
    var _c = schema.required, required = _c === void 0 ? [] : _c;
    var fieldSchema = utils_1.resolvePropSchema(schema, field, definitions);
    var intellisenseScopes = [];
    if (field === 'property') {
        intellisenseScopes.push('variable-scopes');
    }
    var newUiOptions = (_b = (_a = uiOptions.properties) === null || _a === void 0 ? void 0 : _a[field]) !== null && _b !== void 0 ? _b : {};
    newUiOptions.intellisenseScopes = intellisenseScopes;
    return {
        id: id + "." + field,
        schema: fieldSchema !== null && fieldSchema !== void 0 ? fieldSchema : {},
        hidden: utils_1.isPropertyHidden(uiOptions, value, field),
        label: (label === false ? false : undefined),
        name: field,
        rawErrors: rawErrors === null || rawErrors === void 0 ? void 0 : rawErrors[field],
        required: required.includes(field),
        uiOptions: newUiOptions,
        value: value && value[field],
        onChange: onChange(field),
        depth: depth,
        definitions: definitions,
        transparentBorder: transparentBorder,
        className: className,
        onBlur: onBlur,
        onFocus: onFocus,
    };
};
var formRow = {
    row: core_1.css(templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["\n    display: flex;\n\n    label: FormRowContainer;\n  "], ["\n    display: flex;\n\n    label: FormRowContainer;\n  "]))),
    property: core_1.css(templateObject_2 || (templateObject_2 = tslib_1.__makeTemplateObject(["\n    flex: 1;\n    margin: 0;\n\n    & + & {\n      margin-left: 16px;\n    }\n\n    label: FormRowProperty;\n  "], ["\n    flex: 1;\n    margin: 0;\n\n    & + & {\n      margin-left: 16px;\n    }\n\n    label: FormRowProperty;\n  "]))),
    full: core_1.css(templateObject_3 || (templateObject_3 = tslib_1.__makeTemplateObject(["\n    flex: 1;\n\n    label: FormRow;\n  "], ["\n    flex: 1;\n\n    label: FormRow;\n  "]))),
};
var FormRow = function (props) {
    var id = props.id, row = props.row;
    if (Array.isArray(row)) {
        return (core_1.jsx("div", { css: formRow.row }, row.map(function (property) { return (core_1.jsx(SchemaField_1.SchemaField, tslib_1.__assign({ key: id + "." + property, css: formRow.property }, exports.getRowProps(props, property)))); })));
    }
    return core_1.jsx(SchemaField_1.SchemaField, tslib_1.__assign({ key: id + "." + row, css: formRow.full }, exports.getRowProps(props, row)));
};
exports.FormRow = FormRow;
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=FormRow.js.map