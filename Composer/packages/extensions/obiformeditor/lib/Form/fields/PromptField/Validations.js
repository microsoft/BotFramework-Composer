// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
    return r;
  };
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { NeutralColors, FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { swap, remove } from '../../utils';
import { ExpressionWidget } from '../../widgets/ExpressionWidget';
import { WidgetLabel } from '../../widgets/WidgetLabel';
import { validationItem, validationItemInput, validationItemValue, field } from './styles';
var ValidationItem = function(props) {
  var id = props.id,
    value = props.value,
    hasMoveDown = props.hasMoveDown,
    hasMoveUp = props.hasMoveUp,
    onReorder = props.onReorder,
    onDelete = props.onDelete,
    index = props.index,
    formContext = props.formContext,
    onEdit = props.onEdit,
    schema = props.schema;
  var _a = useState(value),
    key = _a[0],
    setKey = _a[1];
  // This needs to return true to dismiss the menu after a click.
  var fabricMenuItemClickHandler = function(fn) {
    return function(e) {
      fn(e);
      return true;
    };
  };
  var contextItems = [
    {
      key: 'moveUp',
      text: 'Move Up',
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: !hasMoveUp,
      onClick: fabricMenuItemClickHandler(function() {
        return onReorder(index, index - 1);
      }),
    },
    {
      key: 'moveDown',
      text: 'Move Down',
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !hasMoveDown,
      onClick: fabricMenuItemClickHandler(function() {
        return onReorder(index, index + 1);
      }),
    },
    {
      key: 'remove',
      text: 'Remove',
      iconProps: { iconName: 'Cancel' },
      onClick: fabricMenuItemClickHandler(function() {
        return onDelete(index);
      }),
    },
  ];
  var handleEdit = function(_e, newVal) {
    onEdit(index, newVal);
  };
  var handleBlur = function() {
    setKey(value);
    if (!value) {
      onDelete(index);
    }
  };
  return jsx(
    'div',
    { css: validationItem },
    jsx(
      'div',
      { css: validationItemValue },
      jsx(ExpressionWidget, {
        key: key,
        value: value,
        id: id,
        label: formatMessage('Validation'),
        editable: true,
        formContext: formContext,
        schema: schema,
        onChange: handleEdit,
        onBlur: handleBlur,
        options: { hideLabel: true },
        styles: {
          root: { margin: '7px 0 7px 0' },
        },
      })
    ),
    jsx(IconButton, {
      menuProps: { items: contextItems },
      menuIconProps: { iconName: 'MoreVertical' },
      ariaLabel: formatMessage('Item Actions'),
      styles: { menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } },
    })
  );
};
export var Validations = function(props) {
  var schema = props.schema,
    id = props.id,
    formData = props.formData,
    formContext = props.formContext;
  var description = schema.description;
  var _a = useState(''),
    newValidation = _a[0],
    setNewValidation = _a[1];
  var handleChange = function(_e, newValue) {
    setNewValidation(newValue || '');
  };
  var submitNewValidation = function(e) {
    if (e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      if (newValidation) {
        props.onChange(__spreadArrays(props.formData, [newValidation]));
        setNewValidation('');
      }
    }
  };
  var handleReorder = function(aIdx, bIdx) {
    props.onChange(swap(props.formData, aIdx, bIdx));
  };
  var handleDelete = function(idx) {
    props.onChange(remove(props.formData, idx));
  };
  var handleEdit = function(idx, val) {
    var validationsCopy = __spreadArrays(props.formData);
    validationsCopy[idx] = val;
    props.onChange(validationsCopy);
  };
  return jsx(
    'div',
    null,
    jsx(WidgetLabel, { label: formatMessage('Validation Rules'), description: description, id: id }),
    jsx(
      'div',
      null,
      formData.map(function(v, i) {
        return jsx(
          ValidationItem,
          // need to use index + length to account for data changing
          {
            // need to use index + length to account for data changing
            key: i + '-' + formData.length,
            value: v,
            index: i,
            id: id + '_' + i,
            onReorder: handleReorder,
            onDelete: handleDelete,
            hasMoveDown: i !== props.formData.length - 1,
            hasMoveUp: i !== 0,
            onEdit: handleEdit,
            formContext: formContext,
            schema: schema,
          }
        );
      })
    ),
    jsx(
      'div',
      { css: [validationItemInput, field] },
      jsx(
        'div',
        { css: validationItemValue },
        jsx(ExpressionWidget, {
          id: id,
          value: newValidation,
          onChange: handleChange,
          placeholder: formatMessage('Add new validation rule here'),
          onKeyDown: submitNewValidation,
          schema: schema,
          formContext: formContext,
          rawErrors: [],
          iconProps: {
            iconName: 'ReturnKey',
            style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
          },
        })
      ),
      jsx(IconButton, {
        disabled: true,
        menuIconProps: { iconName: 'MoreVertical' },
        ariaLabel: formatMessage('Item Actions'),
        styles: {
          menuIcon: {
            backgroundColor: NeutralColors.white,
            color: NeutralColors.gray130,
            fontSize: FontSizes.size16,
          },
          rootDisabled: {
            backgroundColor: NeutralColors.white,
          },
        },
      })
    )
  );
};
//# sourceMappingURL=Validations.js.map
