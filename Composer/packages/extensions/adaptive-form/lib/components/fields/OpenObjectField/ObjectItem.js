"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectItem = void 0;
var tslib_1 = require("tslib");
/** @jsx jsx */
var core_1 = require("@emotion/core");
var react_1 = require("react");
var fluent_theme_1 = require("@uifabric/fluent-theme");
var Button_1 = require("office-ui-fabric-react/lib/Button");
var Tooltip_1 = require("office-ui-fabric-react/lib/Tooltip");
var format_message_1 = tslib_1.__importDefault(require("format-message"));
var StringField_1 = require("../StringField");
var SchemaField_1 = tslib_1.__importDefault(require("../../SchemaField"));
var styles_1 = require("./styles");
var ObjectItem = function (_a) {
    var definitions = _a.definitions, originalName = _a.name, formData = _a.formData, value = _a.value, stackedLayout = _a.stackedLayout, schema = _a.schema, onChange = _a.onChange, onNameChange = _a.onNameChange, onDelete = _a.onDelete, rest = tslib_1.__rest(_a, ["definitions", "name", "formData", "value", "stackedLayout", "schema", "onChange", "onNameChange", "onDelete"]);
    var initialName = react_1.useMemo(function () { return originalName; }, []);
    var initialValue = react_1.useMemo(function () { return value; }, []);
    var _b = react_1.useState(originalName), name = _b[0], setName = _b[1];
    var _c = react_1.useState(''), errorMessage = _c[0], setErrorMessage = _c[1];
    var contextItems = [
        {
            iconProps: { iconName: 'Cancel' },
            key: 'remove',
            onClick: onDelete,
            text: 'Remove',
        },
    ];
    var moreLabel = format_message_1.default('Edit Property');
    var handleBlur = react_1.useCallback(function () {
        if (!name || name === '') {
            setErrorMessage(format_message_1.default('Key cannot be blank'));
        }
        else if (name !== originalName && Object.keys(formData).includes(name)) {
            setErrorMessage(format_message_1.default('Keys must be unique'));
        }
        else {
            onNameChange(name);
            setErrorMessage('');
        }
    }, [name, formData]);
    var placeholder = schema.type === 'string' || !schema.type ? initialValue || format_message_1.default('Add a new value') : undefined;
    return (core_1.jsx("div", { css: styles_1.container, "data-testid": "ObjectItem" },
        core_1.jsx("div", { css: styles_1.itemContainer(stackedLayout) },
            core_1.jsx("div", { css: styles_1.item },
                core_1.jsx(StringField_1.StringField, { definitions: definitions, depth: 0, error: errorMessage, id: name + ".key", label: stackedLayout ? format_message_1.default('Key') : false, name: "key", placeholder: initialName || format_message_1.default('Add a new key'), schema: {}, transparentBorder: !stackedLayout, uiOptions: {}, value: name, onBlur: handleBlur, onChange: function (newValue) { return setName(newValue || ''); } })),
            core_1.jsx("div", { css: styles_1.item },
                core_1.jsx(SchemaField_1.default, tslib_1.__assign({}, rest, { definitions: definitions, id: name + ".value", name: "value", placeholder: placeholder, schema: schema, transparentBorder: !stackedLayout, value: value, onChange: onChange })))),
        core_1.jsx(Tooltip_1.TooltipHost, { content: moreLabel },
            core_1.jsx(Button_1.IconButton, { ariaLabel: moreLabel, "data-testid": "ObjectItemActions", menuIconProps: { iconName: 'MoreVertical' }, menuProps: { items: contextItems }, styles: {
                    root: { margin: '7px 0 7px 0' },
                    menuIcon: { color: fluent_theme_1.NeutralColors.black, fontSize: fluent_theme_1.FontSizes.size16 },
                } }))));
};
exports.ObjectItem = ObjectItem;
//# sourceMappingURL=ObjectItem.js.map