"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectField = void 0;
var tslib_1 = require("tslib");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var react_1 = tslib_1.__importStar(require("react"));
var Dropdown_1 = require("office-ui-fabric-react/lib/Dropdown");
var format_message_1 = tslib_1.__importDefault(require("format-message"));
var FieldLabel_1 = require("../FieldLabel");
exports.SelectField = function SelectField(props) {
    var description = props.description, enumOptions = props.enumOptions, id = props.id, label = props.label, _a = props.onBlur, onBlur = _a === void 0 ? function () { } : _a, onChange = props.onChange, _b = props.onFocus, onFocus = _b === void 0 ? function () { } : _b, _c = props.value, value = _c === void 0 ? '' : _c, error = props.error, uiOptions = props.uiOptions, required = props.required;
    var options = react_1.useMemo(function () {
        var opts = (enumOptions !== null && enumOptions !== void 0 ? enumOptions : []).map(function (o) { return ({
            key: o === null || o === void 0 ? void 0 : o.toString(),
            text: o === null || o === void 0 ? void 0 : o.toString(),
        }); });
        opts.unshift({
            key: '',
            text: '',
        });
        return opts;
    }, [enumOptions]);
    var handleChange = function (_e, option) {
        /* istanbul ignore else */
        if (option) {
            onChange(option.key);
        }
        else {
            onChange(undefined);
        }
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(FieldLabel_1.FieldLabel, { description: description, helpLink: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink, id: id, label: label, required: required }),
        react_1.default.createElement(Dropdown_1.Dropdown, { ariaLabel: label || format_message_1.default('selection field'), "data-testid": "SelectFieldDropdown", errorMessage: error, id: id, options: options, responsiveMode: Dropdown_1.ResponsiveMode.large, selectedKey: value, styles: {
                errorMessage: { display: 'none' },
            }, onBlur: function () { return onBlur(id, value); }, onChange: handleChange, onFocus: function () { return onFocus(id, value); } })));
};
//# sourceMappingURL=SelectField.js.map