"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditableField = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var TextField_1 = require("office-ui-fabric-react/lib/TextField");
var fluent_theme_1 = require("@uifabric/fluent-theme");
var styling_1 = require("@uifabric/styling");
var EditableField = function (props) {
    var depth = props.depth, _a = props.styles, styles = _a === void 0 ? {} : _a, placeholder = props.placeholder, fontSize = props.fontSize, onChange = props.onChange, onBlur = props.onBlur, value = props.value, id = props.id, error = props.error, className = props.className, transparentBorder = props.transparentBorder, ariaLabel = props.ariaLabel;
    var _b = react_1.useState(false), editing = _b[0], setEditing = _b[1];
    var _c = react_1.useState(false), hasFocus = _c[0], setHasFocus = _c[1];
    var _d = react_1.useState(value), localValue = _d[0], setLocalValue = _d[1];
    var _f = react_1.useState(false), hasBeenEdited = _f[0], setHasBeenEdited = _f[1];
    react_1.useEffect(function () {
        if (!hasBeenEdited || value !== localValue) {
            setLocalValue(value);
        }
    }, [value]);
    var handleChange = function (_e, newValue) {
        setLocalValue(newValue);
        setHasBeenEdited(true);
        onChange(newValue);
    };
    var handleCommit = function () {
        setHasFocus(false);
        setEditing(false);
        onBlur && onBlur(id, value);
    };
    var borderColor = undefined;
    if (!editing && !error) {
        borderColor = localValue || transparentBorder || depth > 1 ? 'transparent' : fluent_theme_1.NeutralColors.gray30;
    }
    return (react_1.default.createElement("div", { className: className, onMouseEnter: function () { return setEditing(true); }, onMouseLeave: function () { return !hasFocus && setEditing(false); } },
        react_1.default.createElement(TextField_1.TextField, { ariaLabel: ariaLabel, autoComplete: "off", errorMessage: error, placeholder: placeholder || value, styles: styling_1.mergeStyleSets({
                root: { margin: '0', width: '100%' },
                field: {
                    fontSize: fontSize,
                    selectors: {
                        '::placeholder': {
                            fontSize: fontSize,
                        },
                    },
                },
                fieldGroup: {
                    borderColor: borderColor,
                    transition: 'border-color 0.1s linear',
                    selectors: {
                        ':hover': {
                            borderColor: hasFocus ? undefined : fluent_theme_1.NeutralColors.gray30,
                        },
                    },
                },
            }, styles), value: localValue, onBlur: handleCommit, onChange: handleChange, onFocus: function () { return setHasFocus(true); } })));
};
exports.EditableField = EditableField;
//# sourceMappingURL=EditableField.js.map