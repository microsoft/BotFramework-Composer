"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenObjectField = void 0;
var tslib_1 = require("tslib");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
var core_1 = require("@emotion/core");
var react_1 = require("react");
var Button_1 = require("office-ui-fabric-react/lib/Button");
var fluent_theme_1 = require("@uifabric/fluent-theme");
var Button_2 = require("office-ui-fabric-react/lib/Button");
var TextField_1 = require("office-ui-fabric-react/lib/TextField");
var Tooltip_1 = require("office-ui-fabric-react/lib/Tooltip");
var format_message_1 = tslib_1.__importDefault(require("format-message"));
var FieldLabel_1 = require("../../FieldLabel");
var objectUtils_1 = require("../../../utils/objectUtils");
var styles = tslib_1.__importStar(require("./styles"));
var ObjectItem_1 = require("./ObjectItem");
var OpenObjectField = function (props) {
    var definitions = props.definitions, depth = props.depth, description = props.description, id = props.id, label = props.label, required = props.required, additionalProperties = props.schema.additionalProperties, uiOptions = props.uiOptions, _a = props.value, value = _a === void 0 ? {} : _a, onChange = props.onChange;
    var _b = react_1.useState(''), name = _b[0], setName = _b[1];
    var _c = react_1.useState(''), newValue = _c[0], setNewValue = _c[1];
    var fieldRef = react_1.useRef(null);
    var moreLabel = format_message_1.default('Edit Property');
    var _d = objectUtils_1.useObjectItems(value, onChange), addProperty = _d.addProperty, objectEntries = _d.objectEntries, handleChange = _d.onChange;
    var handleKeyDown = function (event) {
        if (event.key.toLowerCase() === 'enter') {
            event.preventDefault();
            if (name && !Object.keys(value).includes(name)) {
                addProperty(name, newValue);
                if (fieldRef.current) {
                    fieldRef.current.focus();
                }
            }
        }
    };
    var keyLabel = format_message_1.default('Key');
    var valueLabel = format_message_1.default('Value');
    var stackedLayout = typeof additionalProperties === 'object';
    return (core_1.jsx("div", { className: "OpenObjectField" },
        core_1.jsx(FieldLabel_1.FieldLabel, { description: description, helpLink: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink, id: id, label: label, required: required }),
        !stackedLayout && (core_1.jsx("div", { css: styles.labelContainer },
            core_1.jsx("div", { css: styles.label },
                core_1.jsx(FieldLabel_1.FieldLabel, { required: true, id: id + ".key", label: keyLabel })),
            core_1.jsx("div", { css: styles.label },
                core_1.jsx(FieldLabel_1.FieldLabel, { id: id + ".value", label: valueLabel })),
            core_1.jsx("div", { css: styles.filler }))),
        objectEntries.map(function (_a, index) {
            var _b;
            var id = _a.id, propertyName = _a.propertyName, propertyValue = _a.propertyValue;
            return (core_1.jsx(ObjectItem_1.ObjectItem, tslib_1.__assign({ key: index, definitions: definitions, depth: depth + 1, formData: value, id: id + ".value", name: propertyName, schema: typeof additionalProperties === 'object' ? additionalProperties : {}, stackedLayout: stackedLayout, uiOptions: ((_b = uiOptions.properties) === null || _b === void 0 ? void 0 : _b.additionalProperties) || {}, value: propertyValue }, objectUtils_1.getPropertyItemProps(objectEntries, index, handleChange))));
        }),
        additionalProperties &&
            (!stackedLayout ? (core_1.jsx("div", { css: styles.container },
                core_1.jsx("div", { css: styles.item },
                    core_1.jsx(TextField_1.TextField, { ariaLabel: keyLabel, autoComplete: "off", componentRef: fieldRef, placeholder: format_message_1.default('Add a new key'), styles: {
                            root: { margin: '7px 0 7px 0' },
                        }, value: name, onChange: function (_, newValue) { return setName(newValue || ''); }, onKeyDown: handleKeyDown })),
                core_1.jsx("div", { css: styles.item },
                    core_1.jsx(TextField_1.TextField, { ariaLabel: valueLabel, autoComplete: "off", iconProps: {
                            iconName: 'ReturnKey',
                            style: { color: fluent_theme_1.SharedColors.cyanBlue10, opacity: 0.6 },
                        }, placeholder: format_message_1.default('Add a new value'), styles: {
                            root: { margin: '7px 0 7px 0' },
                        }, value: newValue, onChange: function (_, newValue) { return setNewValue(newValue || ''); }, onKeyDown: handleKeyDown })),
                core_1.jsx(Tooltip_1.TooltipHost, { content: moreLabel },
                    core_1.jsx(Button_2.IconButton, { disabled: true, ariaLabel: moreLabel, menuIconProps: { iconName: 'MoreVertical' }, styles: {
                            menuIcon: { fontSize: fluent_theme_1.FontSizes.size16 },
                            root: { margin: '7px 0 7px 0' },
                            rootDisabled: {
                                backgroundColor: fluent_theme_1.NeutralColors.white,
                            },
                        } })))) : (core_1.jsx("div", { css: styles.addButtonContainer },
                core_1.jsx(Button_1.DefaultButton, { type: "button", onClick: function () { return addProperty(); } }, format_message_1.default('Add')))))));
};
exports.OpenObjectField = OpenObjectField;
//# sourceMappingURL=OpenObjectField.js.map