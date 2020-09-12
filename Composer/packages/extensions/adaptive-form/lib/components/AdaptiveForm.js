"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptiveForm = void 0;
var tslib_1 = require("tslib");
/** @jsx jsx */
var core_1 = require("@emotion/core");
var react_error_boundary_1 = tslib_1.__importDefault(require("react-error-boundary"));
var format_message_1 = tslib_1.__importDefault(require("format-message"));
var SchemaField_1 = require("./SchemaField");
var FormTitle_1 = tslib_1.__importDefault(require("./FormTitle"));
var ErrorInfo_1 = tslib_1.__importDefault(require("./ErrorInfo"));
var LoadingTimeout_1 = require("./LoadingTimeout");
var styles = {
    errorLoading: core_1.css(templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["\n    padding: 18px;\n  "], ["\n    padding: 18px;\n  "]))),
};
exports.AdaptiveForm = function AdaptiveForm(props) {
    var _a;
    var errors = props.errors, formData = props.formData, schema = props.schema, uiOptions = props.uiOptions, onChange = props.onChange;
    if (!formData || !schema) {
        return (core_1.jsx(LoadingTimeout_1.LoadingTimeout, { timeout: 2000 },
            core_1.jsx("div", { css: styles.errorLoading }, format_message_1.default('{type} could not be loaded', {
                type: formData ? format_message_1.default('Schema') : format_message_1.default('Dialog data'),
            }))));
    }
    return (core_1.jsx(react_error_boundary_1.default, { FallbackComponent: ErrorInfo_1.default },
        core_1.jsx(FormTitle_1.default, { formData: formData, id: ((_a = formData.$designer) === null || _a === void 0 ? void 0 : _a.id) || 'unknown', schema: schema, uiOptions: uiOptions, onChange: function (newData) { return onChange(tslib_1.__assign(tslib_1.__assign({}, formData), newData)); } }),
        core_1.jsx(SchemaField_1.SchemaField, { definitions: schema === null || schema === void 0 ? void 0 : schema.definitions, depth: -1, id: "root", name: "root", rawErrors: errors, schema: schema, uiOptions: uiOptions, value: formData, onChange: onChange })));
};
var templateObject_1;
//# sourceMappingURL=AdaptiveForm.js.map