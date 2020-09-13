'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ArrayField = void 0;
var tslib_1 = require('tslib');
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
var core_1 = require('@emotion/core');
var react_1 = require('react');
var TextField_1 = require('office-ui-fabric-react/lib/TextField');
var Button_1 = require('office-ui-fabric-react/lib/Button');
var Tooltip_1 = require('office-ui-fabric-react/lib/Tooltip');
var fluent_theme_1 = require('@uifabric/fluent-theme');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var utils_1 = require('../../utils');
var FieldLabel_1 = require('../FieldLabel');
var styles_1 = require('./styles');
var ArrayFieldItem_1 = require('./ArrayFieldItem');
var UnsupportedField_1 = require('./UnsupportedField');
var ArrayField = function (props) {
  var _a = props.value,
    value = _a === void 0 ? [] : _a,
    onChange = props.onChange,
    schema = props.schema,
    label = props.label,
    description = props.description,
    id = props.id,
    _b = props.rawErrors,
    rawErrors = _b === void 0 ? [] : _b,
    uiOptions = props.uiOptions,
    className = props.className,
    required = props.required,
    rest = tslib_1.__rest(props, [
      'value',
      'onChange',
      'schema',
      'label',
      'description',
      'id',
      'rawErrors',
      'uiOptions',
      'className',
      'required',
    ]);
  var _c = react_1.useState(),
    newValue = _c[0],
    setNewValue = _c[1];
  var _d = utils_1.useArrayItems(value, onChange),
    arrayItems = _d.arrayItems,
    handleChange = _d.handleChange,
    addItem = _d.addItem;
  var moreLabel = format_message_1.default('Item Actions');
  var handleNewChange = function (_e, newValue) {
    return setNewValue(newValue || '');
  };
  var handleKeyDown = function (event) {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();
      if (newValue) {
        addItem(newValue);
        setNewValue('');
      }
    }
  };
  var itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
  if (!itemSchema || itemSchema === true) {
    return core_1.jsx(UnsupportedField_1.UnsupportedField, tslib_1.__assign({}, props));
  }
  return core_1.jsx(
    'div',
    { className: className },
    core_1.jsx(FieldLabel_1.FieldLabel, {
      description: description,
      helpLink: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink,
      id: id,
      label: label,
      required: required,
    }),
    core_1.jsx(
      'div',
      null,
      arrayItems.map(function (element, idx) {
        return core_1.jsx(
          ArrayFieldItem_1.ArrayFieldItem,
          tslib_1.__assign(
            {},
            rest,
            {
              key: element.id,
              stackArrayItems: true,
              transparentBorder: true,
              error: rawErrors[idx],
              id: id,
              label: false,
              rawErrors: rawErrors[idx],
              schema: itemSchema,
              uiOptions: uiOptions,
              value: element.value,
            },
            utils_1.getArrayItemProps(arrayItems, idx, handleChange)
          )
        );
      })
    ),
    core_1.jsx(
      'div',
      { css: styles_1.arrayField.inputFieldContainer },
      core_1.jsx(
        'div',
        { css: styles_1.arrayField.field },
        core_1.jsx(TextField_1.TextField, {
          ariaLabel: format_message_1.default('New value'),
          'data-testid': 'string-array-text-input',
          iconProps: {
            iconName: 'ReturnKey',
            style: { color: fluent_theme_1.SharedColors.cyanBlue10, opacity: 0.6 },
          },
          styles: { root: { width: '100%' } },
          value: newValue,
          onChange: handleNewChange,
          onKeyDown: handleKeyDown,
        }),
        core_1.jsx(
          Tooltip_1.TooltipHost,
          { content: moreLabel },
          core_1.jsx(Button_1.IconButton, {
            disabled: true,
            ariaLabel: moreLabel,
            menuIconProps: { iconName: 'MoreVertical' },
            styles: {
              menuIcon: {
                backgroundColor: fluent_theme_1.NeutralColors.white,
                color: fluent_theme_1.NeutralColors.gray130,
                fontSize: fluent_theme_1.FontSizes.size16,
              },
              rootDisabled: {
                backgroundColor: fluent_theme_1.NeutralColors.white,
              },
            },
          })
        )
      )
    )
  );
};
exports.ArrayField = ArrayField;
//# sourceMappingURL=ArrayField.js.map
