"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectArrayField = void 0;
var tslib_1 = require("tslib");
/** @jsx jsx */
var core_1 = require("@emotion/core");
var react_1 = tslib_1.__importStar(require("react"));
var extension_1 = require("@bfc/extension");
var Button_1 = require("office-ui-fabric-react/lib/Button");
var Button_2 = require("office-ui-fabric-react/lib/Button");
var TextField_1 = require("office-ui-fabric-react/lib/TextField");
var Tooltip_1 = require("office-ui-fabric-react/lib/Tooltip");
var fluent_theme_1 = require("@uifabric/fluent-theme");
var format_message_1 = tslib_1.__importDefault(require("format-message"));
var map_1 = tslib_1.__importDefault(require("lodash/map"));
var utils_1 = require("../../utils");
var FieldLabel_1 = require("../FieldLabel");
var styles_1 = require("./styles");
var ArrayFieldItem_1 = require("./ArrayFieldItem");
var UnsupportedField_1 = require("./UnsupportedField");
var getNewPlaceholder = function (props, propertyName) {
    var _a, _b;
    var uiOptions = props.uiOptions;
    var placeholderOverride = (_b = (_a = uiOptions.properties) === null || _a === void 0 ? void 0 : _a[propertyName]) === null || _b === void 0 ? void 0 : _b.placeholder;
    if (placeholderOverride) {
        return typeof placeholderOverride === 'function' ? placeholderOverride(undefined) : placeholderOverride;
    }
    return format_message_1.default('Add new {propertyName}', { propertyName: propertyName });
};
var ObjectArrayField = function (props) {
    var _a = props.value, value = _a === void 0 ? [] : _a, schema = props.schema, id = props.id, onChange = props.onChange, className = props.className, uiOptions = props.uiOptions, label = props.label, description = props.description, required = props.required;
    var items = schema.items;
    var itemSchema = Array.isArray(items) ? items[0] : items;
    var properties = (itemSchema && itemSchema !== true && itemSchema.properties) || {};
    var _b = react_1.useState({}), newObject = _b[0], setNewObject = _b[1];
    var _c = utils_1.useArrayItems(value, onChange), arrayItems = _c.arrayItems, handleChange = _c.handleChange, addItem = _c.addItem;
    var firstNewFieldRef = react_1.useRef(null);
    var announce = extension_1.useShellApi().shellApi.announce;
    var moreLabel = format_message_1.default('Item actions');
    var END_OF_ROW_LABEL = format_message_1.default('press Enter to add this item or Tab to move to the next interactive element');
    var INSIDE_ROW_LABEL = format_message_1.default('press Enter to add this name and advance to the next row, or press Tab to advance to the value field');
    var handleNewObjectChange = function (property) { return function (_e, newValue) {
        var _a;
        setNewObject(tslib_1.__assign(tslib_1.__assign({}, newObject), (_a = {}, _a[property] = newValue, _a)));
    }; };
    var handleKeyDown = function (event) {
        var _a;
        if (event.key.toLowerCase() === 'enter') {
            event.preventDefault();
            if (Object.keys(newObject).length > 0) {
                var formattedData = Object.entries(newObject).reduce(function (obj, _a) {
                    var _b;
                    var _c, _d, _f;
                    var key = _a[0], value = _a[1];
                    var serializeValue = (_f = (_d = (_c = uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.properties) === null || _c === void 0 ? void 0 : _c[key]) === null || _d === void 0 ? void 0 : _d.serializer) === null || _f === void 0 ? void 0 : _f.set;
                    return tslib_1.__assign(tslib_1.__assign({}, obj), (_b = {}, _b[key] = typeof serializeValue === 'function' ? serializeValue(value) : value, _b));
                }, {});
                announce(INSIDE_ROW_LABEL);
                addItem(formattedData);
                setNewObject({});
                (_a = firstNewFieldRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }
        }
    };
    var handleAdd = function () {
        addItem({});
    };
    var orderedProperties = utils_1.getOrderedProperties(itemSchema && typeof itemSchema !== 'boolean' ? itemSchema : {}, uiOptions, value).filter(function (property) { return Array.isArray(property) || !utils_1.isPropertyHidden(uiOptions, value, property); });
    var stackArrayItems = react_1.useMemo(function () {
        var allOrderProps = orderedProperties.reduce(function (all, prop) {
            return tslib_1.__spreadArrays(all, (Array.isArray(prop) ? prop : [prop]));
        }, []);
        return (allOrderProps.length > 2 ||
            orderedProperties.some(function (property) { return Array.isArray(property); }) ||
            Object.entries(properties).some(function (_a) {
                var key = _a[0], propSchema = _a[1];
                var resolved = utils_1.resolveRef(propSchema, props.definitions);
                return allOrderProps.includes(key) && resolved.$role === 'expression';
            }));
    }, [itemSchema, orderedProperties]);
    if (!itemSchema || itemSchema === true) {
        return core_1.jsx(UnsupportedField_1.UnsupportedField, tslib_1.__assign({}, props));
    }
    return (core_1.jsx("div", { className: className },
        core_1.jsx(FieldLabel_1.FieldLabel, { description: description, helpLink: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink, id: id, label: label, required: required }),
        core_1.jsx("div", null,
            orderedProperties.length > 1 && !stackArrayItems && (core_1.jsx("div", { css: styles_1.objectArrayField.objectItemLabel },
                orderedProperties.map(function (key, index) {
                    if (typeof key === 'string') {
                        var propSchema = properties[key];
                        if (propSchema && propSchema !== true) {
                            return (core_1.jsx("div", { key: index, css: styles_1.objectArrayField.objectItemValueLabel },
                                core_1.jsx(FieldLabel_1.FieldLabel, { inline: true, description: propSchema.description, id: id + "." + key, label: propSchema.title })));
                        }
                    }
                }),
                core_1.jsx("div", { style: { width: '32px' } }))),
            map_1.default(arrayItems, function (item, idx) { return (core_1.jsx(ArrayFieldItem_1.ArrayFieldItem, tslib_1.__assign({ key: item.id }, props, { transparentBorder: true, id: id + "." + idx, schema: itemSchema, stackArrayItems: stackArrayItems, value: item.value }, utils_1.getArrayItemProps(arrayItems, idx, handleChange)))); })),
        core_1.jsx("div", { css: styles_1.objectArrayField.inputFieldContainer }, !stackArrayItems ? (core_1.jsx(react_1.default.Fragment, null,
            core_1.jsx("div", { css: styles_1.objectArrayField.arrayItemField }, orderedProperties
                .filter(function (p) { return !Array.isArray(p); })
                .map(function (property, index, allProperties) {
                var lastField = index === allProperties.length - 1;
                if (typeof property === 'string') {
                    return (core_1.jsx("div", { key: index, css: styles_1.objectArrayField.objectItemInputField },
                        core_1.jsx(TextField_1.TextField, { ariaLabel: lastField ? END_OF_ROW_LABEL : INSIDE_ROW_LABEL, autoComplete: "off", componentRef: index === 0 ? firstNewFieldRef : undefined, iconProps: tslib_1.__assign({}, (lastField
                                ? {
                                    iconName: 'ReturnKey',
                                    style: {
                                        color: fluent_theme_1.SharedColors.cyanBlue10,
                                        opacity: 0.6,
                                    },
                                }
                                : {})), placeholder: getNewPlaceholder(props, property), styles: { field: { padding: '0 24px 0 8px' } }, value: newObject[property] || '', onChange: handleNewObjectChange(property), onKeyDown: handleKeyDown })));
                }
            })),
            core_1.jsx(Tooltip_1.TooltipHost, { content: moreLabel },
                core_1.jsx(Button_2.IconButton, { disabled: true, ariaLabel: moreLabel, menuIconProps: { iconName: 'MoreVertical' }, styles: {
                        menuIcon: {
                            backgroundColor: fluent_theme_1.NeutralColors.white,
                            color: fluent_theme_1.NeutralColors.gray130,
                            fontSize: fluent_theme_1.FontSizes.size16,
                        },
                        rootDisabled: {
                            backgroundColor: fluent_theme_1.NeutralColors.white,
                        },
                    } })))) : (core_1.jsx(Button_1.DefaultButton, { type: "button", onClick: handleAdd }, format_message_1.default('Add'))))));
};
exports.ObjectArrayField = ObjectArrayField;
//# sourceMappingURL=ObjectArrayField.js.map