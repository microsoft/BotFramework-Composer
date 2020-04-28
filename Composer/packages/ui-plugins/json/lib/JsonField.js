"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/** @jsx jsx */
var core_1 = require("@emotion/core");
var react_1 = __importDefault(require("react"));
var adaptive_form_1 = require("@bfc/adaptive-form");
var code_editor_1 = require("@bfc/code-editor");
var fieldStyle = core_1.css(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  height: 300px;\n\n  label: JsonField;\n"], ["\n  height: 300px;\n\n  label: JsonField;\n"])));
var JsonField = function (props) {
    var _a;
    var onChange = props.onChange, value = props.value, id = props.id, label = props.label, description = props.description, uiOptions = props.uiOptions, required = props.required;
    return (core_1.jsx(react_1.default.Fragment, null,
        core_1.jsx(adaptive_form_1.FieldLabel, { description: description, id: id, label: label, helpLink: (_a = uiOptions) === null || _a === void 0 ? void 0 : _a.helpLink, required: required }),
        core_1.jsx("div", { css: fieldStyle },
            core_1.jsx(code_editor_1.JsonEditor, { value: value, onChange: onChange }))));
};
exports.JsonField = JsonField;
var templateObject_1;
//# sourceMappingURL=JsonField.js.map