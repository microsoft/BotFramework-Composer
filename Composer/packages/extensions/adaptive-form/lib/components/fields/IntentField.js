"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentField = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var extension_1 = require("@bfc/extension");
var format_message_1 = tslib_1.__importDefault(require("format-message"));
var shared_1 = require("@bfc/shared");
var FieldLabel_1 = require("../FieldLabel");
var IntentField = function (props) {
    var _a;
    var id = props.id, description = props.description, uiOptions = props.uiOptions, value = props.value, required = props.required, onChange = props.onChange;
    var currentDialog = extension_1.useShellApi().currentDialog;
    var recognizers = extension_1.useRecognizerConfig();
    var handleChange = function () {
        onChange(value);
    };
    var recognizer = recognizers.find(function (r) { var _a; return r.isSelected((_a = currentDialog === null || currentDialog === void 0 ? void 0 : currentDialog.content) === null || _a === void 0 ? void 0 : _a.recognizer); });
    var Editor;
    if (recognizer && recognizer.id === shared_1.SDKKinds.CrossTrainedRecognizerSet) {
        Editor = (_a = recognizers.find(function (r) { return r.id === shared_1.SDKKinds.LuisRecognizer; })) === null || _a === void 0 ? void 0 : _a.editor;
    }
    else {
        Editor = recognizer === null || recognizer === void 0 ? void 0 : recognizer.editor;
    }
    var label = format_message_1.default('Trigger phrases (intent: #{intentName})', { intentName: value });
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(FieldLabel_1.FieldLabel, { description: description, helpLink: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink, id: id, label: label, required: required }),
        Editor ? (react_1.default.createElement(Editor, tslib_1.__assign({}, props, { onChange: handleChange }))) : (format_message_1.default('No Editor for {type}', { type: recognizer === null || recognizer === void 0 ? void 0 : recognizer.id }))));
};
exports.IntentField = IntentField;
//# sourceMappingURL=IntentField.js.map