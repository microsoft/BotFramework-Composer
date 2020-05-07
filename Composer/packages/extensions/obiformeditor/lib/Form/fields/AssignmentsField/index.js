// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { NeutralColors, FontSizes, SharedColors } from '@uifabric/fluent-theme';
import get from 'lodash/get';
import { swap, remove } from '../../utils';
import { TextWidget } from '../../widgets';
import {
  field,
  assignmentField,
  assignmentItem,
  assignmentItemContainer,
  assignmentItemLabel,
  assignmentItemValue,
  assignmentItemValueLabel,
  assignmentItemErrorMessage,
} from './styles';
var AssignmentItem = function(props) {
  var assignment = props.assignment,
    index = props.index,
    onEdit = props.onEdit,
    hasMoveUp = props.hasMoveUp,
    hasMoveDown = props.hasMoveDown,
    onReorder = props.onReorder,
    onDelete = props.onDelete,
    schema = props.schema,
    idSchema = props.idSchema,
    uiSchema = props.uiSchema,
    formContext = props.formContext;
  var _a = useState(assignment.value + ':' + assignment.property),
    key = _a[0],
    setKey = _a[1];
  var options = uiSchema['ui:options'];
  var getSchema = function(field) {
    return get(schema, ['items', 'properties', field]);
  };
  var contextItems = [
    {
      key: 'moveUp',
      text: 'Move Up',
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: !hasMoveUp,
      onClick: function() {
        return onReorder(index, index - 1);
      },
    },
    {
      key: 'moveDown',
      text: 'Move Down',
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !hasMoveDown,
      onClick: function() {
        return onReorder(index, index + 1);
      },
    },
    {
      key: 'remove',
      text: 'Remove',
      iconProps: { iconName: 'Cancel' },
      onClick: function() {
        return onDelete(index);
      },
    },
  ];
  var handleEdit = function(field) {
    return function(val) {
      var _a;
      onEdit(index, __assign(__assign({}, assignment), ((_a = {}), (_a[field] = val), _a)));
    };
  };
  var handleBlur = function() {
    setKey(assignment.value + ':' + assignment.property);
    if (!assignment.value && !assignment.property) {
      onDelete(index);
    }
  };
  var _b = useState({ property: undefined, value: undefined }),
    errorMessages = _b[0],
    setErrorMessages = _b[1];
  var handleValidation = function(field) {
    return function(err) {
      setErrorMessages(function(errorMessages) {
        var _a;
        return __assign(__assign({}, errorMessages), ((_a = {}), (_a[field] = err), _a));
      });
    };
  };
  return jsx(
    'div',
    { css: [assignmentItemContainer(), assignmentItem], key: key },
    jsx(
      'div',
      { css: assignmentItemValue },
      jsx(TextWidget, {
        onChange: handleEdit('property'),
        value: assignment.property,
        schema: getSchema('property'),
        id: idSchema.property && idSchema.property.__id.replace('assignments_', 'assignments_' + index + '_'),
        label: formatMessage('Property'),
        formContext: formContext,
        onBlur: handleBlur,
        hiddenErrMessage: true,
        onValidate: handleValidation('property'),
        options: options,
      })
    ),
    jsx(
      'div',
      { css: assignmentItemValue },
      jsx(TextWidget, {
        onChange: handleEdit('value'),
        value: assignment.value,
        schema: getSchema('value'),
        id: idSchema.value && idSchema.value.__id.replace('assignments_', 'assignments_' + index + '_'),
        label: formatMessage('Value'),
        formContext: formContext,
        onBlur: handleBlur,
        hiddenErrMessage: true,
        onValidate: handleValidation('value'),
        options: options,
      })
    ),
    jsx(
      'div',
      null,
      jsx(IconButton, {
        menuProps: { items: contextItems },
        menuIconProps: { iconName: 'MoreVertical' },
        ariaLabel: formatMessage('Item Actions'),
        styles: { menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } },
      })
    ),
    jsx('div', { css: assignmentItemErrorMessage }, errorMessages && (errorMessages.property || errorMessages.value))
  );
};
export var AssignmentsField = function(props) {
  var _a = props.formData,
    formData = _a === void 0 ? [] : _a,
    idSchema = props.idSchema,
    onChange = props.onChange;
  var _b = useState({ property: '', value: '' }),
    newassignment = _b[0],
    setNewassignment = _b[1];
  var _c = useState(''),
    errorMsg = _c[0],
    setErrorMsg = _c[1];
  var id = idSchema.__id;
  var handleReorder = function(aIdx, bIdx) {
    onChange(swap(formData, aIdx, bIdx));
  };
  var handleDelete = function(idx) {
    onChange(remove(formData, idx));
  };
  var handleEdit = function(idx, val) {
    var assignments = __spreadArrays(formData);
    assignments[idx] = val;
    onChange(assignments);
  };
  var handleNewassignmentEdit = function(field) {
    return function(_e, data) {
      var _a;
      setNewassignment(__assign(__assign({}, newassignment), ((_a = {}), (_a[field] = data), _a)));
    };
  };
  var handleKeyDown = function(e) {
    if (e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      if (newassignment) {
        if (newassignment.value) {
          onChange(__spreadArrays(formData, [newassignment]));
          setNewassignment({ property: '', value: '' });
          setErrorMsg('');
        } else {
          setErrorMsg(formatMessage('value required'));
        }
      }
    }
  };
  return jsx(
    'div',
    null,
    jsx(
      'div',
      { css: [assignmentItemContainer('flex-start'), assignmentItemLabel] },
      jsx('div', { css: [assignmentItemValue, assignmentItemValueLabel] }, formatMessage('property')),
      jsx('div', { css: [assignmentItemValue, assignmentItemValueLabel] }, formatMessage('value'))
    ),
    jsx(
      'div',
      { css: assignmentField },
      Array.isArray(formData) &&
        formData.map(function(c, i) {
          return jsx(
            AssignmentItem,
            __assign(
              {
                key: i + '-' + formData.length,
                assignment: c,
                index: i,
                onEdit: handleEdit,
                onReorder: handleReorder,
                onDelete: handleDelete,
                hasMoveDown: i !== formData.length - 1,
                hasMoveUp: i !== 0,
              },
              props
            )
          );
        })
    ),
    jsx(
      'div',
      { css: field },
      jsx(
        'div',
        { css: assignmentItemContainer('flex-start'), onKeyDown: handleKeyDown },
        jsx(
          'div',
          { css: assignmentItemValue },
          jsx(TextField, {
            id: id + '-property',
            value: newassignment ? newassignment.property : '',
            onChange: handleNewassignmentEdit('property'),
            placeholder: formatMessage('Property (named location to store information).'),
            autoComplete: 'off',
          })
        ),
        jsx(
          'div',
          { css: assignmentItemValue },
          jsx(TextField, {
            id: id + '-value',
            value: newassignment ? newassignment.value : '',
            onChange: handleNewassignmentEdit('value'),
            placeholder: formatMessage('New value or expression.'),
            autoComplete: 'off',
            errorMessage: errorMsg,
            iconProps: {
              iconName: 'ReturnKey',
              style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
            },
          })
        ),
        jsx(
          'div',
          null,
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
      )
    )
  );
};
//# sourceMappingURL=index.js.map
