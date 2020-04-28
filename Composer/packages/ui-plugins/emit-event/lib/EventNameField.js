"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var adaptive_form_1 = require("@bfc/adaptive-form");
var ComboBox_1 = require("office-ui-fabric-react/lib/ComboBox");
var format_message_1 = __importDefault(require("format-message"));
var EventNameField = function (props) {
    var _a;
    var enumOptions = props.enumOptions, value = props.value, description = props.description, id = props.id, label = props.label, uiOptions = props.uiOptions, onChange = props.onChange, error = props.error, required = props.required;
    var options = ((enumOptions !== null && enumOptions !== void 0 ? enumOptions : [])).map(function (o) {
        var _a, _b;
        return ({
            key: (_a = o) === null || _a === void 0 ? void 0 : _a.toString(),
            text: (_b = o) === null || _b === void 0 ? void 0 : _b.toString(),
        });
    });
    var handleChange = function (e, option, index, value) {
        if (option) {
            onChange(option.key);
        }
        else if (value) {
            onChange(value);
        }
        else {
            onChange(undefined);
        }
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(adaptive_form_1.FieldLabel, { description: description, id: id, label: label, helpLink: (_a = uiOptions) === null || _a === void 0 ? void 0 : _a.helpLink, required: required }),
        react_1.default.createElement(ComboBox_1.ComboBox, { id: id, text: value, options: options, placeholder: format_message_1.default('Select event type or type a custom one'), allowFreeform: true, autoComplete: "on", onChange: handleChange, errorMessage: error, useComboBoxAsMenuWidth: true, styles: {
                errorMessage: { display: 'none' },
            } })));
};
exports.EventNameField = EventNameField;
//# sourceMappingURL=EventNameField.js.map