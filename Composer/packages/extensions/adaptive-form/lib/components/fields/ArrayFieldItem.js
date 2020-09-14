'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ArrayFieldItem = void 0;
var tslib_1 = require('tslib');
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
var core_1 = require('@emotion/core');
var fluent_theme_1 = require('@uifabric/fluent-theme');
var Button_1 = require('office-ui-fabric-react/lib/Button');
var styling_1 = require('@uifabric/styling');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var SchemaField_1 = tslib_1.__importDefault(require('../SchemaField'));
var styles_1 = require('./styles');
var ArrayFieldItem = function (props) {
  var canMoveUp = props.canMoveUp,
    canMoveDown = props.canMoveDown,
    canRemove = props.canRemove,
    onReorder = props.onReorder,
    onRemove = props.onRemove,
    index = props.index,
    label = props.label,
    depth = props.depth,
    onBlur = props.onBlur,
    stackArrayItems = props.stackArrayItems,
    transparentBorder = props.transparentBorder,
    uiOptions = props.uiOptions,
    value = props.value,
    className = props.className,
    rawErrors = props.rawErrors,
    rest = tslib_1.__rest(props, [
      'canMoveUp',
      'canMoveDown',
      'canRemove',
      'onReorder',
      'onRemove',
      'index',
      'label',
      'depth',
      'onBlur',
      'stackArrayItems',
      'transparentBorder',
      'uiOptions',
      'value',
      'className',
      'rawErrors',
    ]);
  // This needs to return true to dismiss the menu after a click.
  var fabricMenuItemClickHandler = function (fn) {
    return function (e) {
      fn(e);
      return true;
    };
  };
  var contextItems = [
    {
      key: 'moveUp',
      text: format_message_1.default('Move Up'),
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: !canMoveUp,
      onClick: fabricMenuItemClickHandler(function () {
        return onReorder(index - 1);
      }),
    },
    {
      key: 'moveDown',
      text: format_message_1.default('Move Down'),
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !canMoveDown,
      onClick: fabricMenuItemClickHandler(function () {
        return onReorder(index + 1);
      }),
    },
    {
      key: 'remove',
      text: format_message_1.default('Remove'),
      iconProps: { iconName: 'Cancel' },
      disabled: !canRemove,
      onClick: fabricMenuItemClickHandler(onRemove),
    },
  ];
  var handleBlur = function () {
    if (!value || (typeof value === 'object' && !Object.values(value).some(Boolean))) {
      onRemove();
    }
    if (typeof onBlur === 'function') {
      onBlur(rest.id, value);
    }
  };
  return core_1.jsx(
    'div',
    { className: className, css: styles_1.arrayItem.container, 'data-testid': 'ArrayFieldItem' },
    core_1.jsx(
      'div',
      { css: styles_1.arrayItem.field },
      core_1.jsx(
        SchemaField_1.default,
        tslib_1.__assign({}, rest, {
          css: styles_1.arrayItem.schemaFieldOverride(!!stackArrayItems),
          depth: depth + 1,
          label: !stackArrayItems || label === false ? false : undefined,
          rawErrors: typeof rawErrors === 'object' ? rawErrors[index] : rawErrors,
          transparentBorder: !stackArrayItems ? transparentBorder : undefined,
          uiOptions: uiOptions,
          value: value,
          onBlur: handleBlur,
        })
      )
    ),
    core_1.jsx(Button_1.IconButton, {
      ariaLabel: format_message_1.default('Item Actions'),
      menuIconProps: { iconName: 'MoreVertical' },
      menuProps: { items: contextItems },
      styles: {
        menuIcon: { color: fluent_theme_1.NeutralColors.black, fontSize: styling_1.FontSizes.medium },
      },
    })
  );
};
exports.ArrayFieldItem = ArrayFieldItem;
//# sourceMappingURL=ArrayFieldItem.js.map
