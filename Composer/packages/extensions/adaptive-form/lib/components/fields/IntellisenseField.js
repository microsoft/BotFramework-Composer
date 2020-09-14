"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntellisenseField = void 0;
var tslib_1 = require("tslib");
var intellisense_1 = require("@bfc/intellisense");
var react_1 = tslib_1.__importDefault(require("react"));
var TextField_1 = require("office-ui-fabric-react/lib/TextField");
var FieldLabel_1 = require("../FieldLabel");
var getIntellisenseUrl_1 = require("../../utils/getIntellisenseUrl");
exports.IntellisenseField = function IntellisenseField(props) {
    var id = props.id, _a = props.value, value = _a === void 0 ? '' : _a, onChange = props.onChange, label = props.label, description = props.description, uiOptions = props.uiOptions, required = props.required;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(FieldLabel_1.FieldLabel, { description: description, helpLink: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink, id: id, label: label, required: required }),
        react_1.default.createElement(intellisense_1.IntellisenseTextField, { id: "intellisense-" + id, scopes: uiOptions.intellisenseScopes || [], url: getIntellisenseUrl_1.getIntellisenseUrl(), value: value, onChange: onChange }, function (textFieldValue, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField) { return (react_1.default.createElement(TextField_1.TextField, { id: id, value: textFieldValue, onChange: function (_e, newValue) { return onValueChanged(newValue || ''); }, onClick: onClickTextField, onKeyDown: onKeyDownTextField, onKeyUp: onKeyUpTextField })); })));
};
//# sourceMappingURL=IntellisenseField.js.map