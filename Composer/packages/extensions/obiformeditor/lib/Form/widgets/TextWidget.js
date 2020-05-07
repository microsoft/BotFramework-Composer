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
import React from 'react';
import { NeutralColors } from '@uifabric/fluent-theme';
import { SpinButton } from 'office-ui-fabric-react/lib/SpinButton';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ExpressionWidget } from './ExpressionWidget';
import { WidgetLabel } from './WidgetLabel';
var getInt = function(value, step) {
  return parseInt(value, 10) + step;
};
var getFloat = function(value, step) {
  return (parseFloat(value) + step).toFixed(step > 0 ? ('' + step).split('.')[1].length : step);
};
export function TextWidget(props) {
  var label = props.label,
    onBlur = props.onBlur,
    onChange = props.onChange,
    onFocus = props.onFocus,
    readonly = props.readonly,
    value = props.value,
    placeholder = props.placeholder,
    schema = props.schema,
    id = props.id,
    disabled = props.disabled,
    formContext = props.formContext,
    rawErrors = props.rawErrors,
    hiddenErrMessage = props.hiddenErrMessage,
    onValidate = props.onValidate,
    _a = props.options,
    options = _a === void 0 ? {} : _a;
  var description = schema.description,
    _b = schema.examples,
    examples = _b === void 0 ? [] : _b,
    type = schema.type,
    $role = schema.$role;
  var hideLabel = options.hideLabel,
    transparentBorder = options.transparentBorder;
  var placeholderText = placeholder;
  if (!placeholderText && examples.length > 0) {
    placeholderText = 'ex. ' + examples.join(', ');
  }
  if (type === 'integer' || type === 'number') {
    var updateValue = function(step) {
      return function(value) {
        // if the number is a float, we need to convert to a fixed decimal place
        // in order to avoid floating point math rounding errors (ex. 1.2000000001)
        // ex. if step = 0.01, we fix to 2 decimals
        var newValue = type === 'integer' ? getInt(value, step) : getFloat(value, step);
        onChange(newValue);
        // need to allow form data to propagate before flushing to state
        setTimeout(function() {
          return onBlur && onBlur(id, value);
        });
      };
    };
    var step = type === 'integer' ? 1 : 0.1;
    return React.createElement(
      React.Fragment,
      null,
      !hideLabel && React.createElement(WidgetLabel, { label: label, description: description, id: id }),
      React.createElement(SpinButton, {
        onDecrement: updateValue(-step),
        onIncrement: updateValue(step),
        onValidate: updateValue(0),
        disabled: Boolean(schema.const) || readonly || disabled,
        step: step,
        value: value,
        styles: {
          labelWrapper: { display: 'none' },
        },
      })
    );
  }
  var sharedProps = {
    disabled: disabled,
    id: id,
    value: value,
    autoComplete: 'off',
    onBlur: function() {
      onBlur && onBlur(id, value);
    },
    onChange: function(_, newValue) {
      return onChange(newValue);
    },
    onFocus: function() {
      onFocus && onFocus(id, value);
    },
    placeholder: placeholderText,
    readOnly: Boolean(schema.const) || readonly,
  };
  if ($role === 'expression') {
    return React.createElement(
      ExpressionWidget,
      __assign({}, sharedProps, {
        editable: transparentBorder,
        label: label,
        schema: schema,
        formContext: formContext,
        rawErrors: rawErrors,
        styles: { root: { margin: 0 } },
        hiddenErrMessage: hiddenErrMessage,
        onValidate: onValidate,
        options: options,
      })
    );
  }
  return React.createElement(
    React.Fragment,
    null,
    !hideLabel && React.createElement(WidgetLabel, { label: label, description: description, id: id }),
    React.createElement(
      TextField,
      __assign(
        {
          styles: {
            fieldGroup: {
              borderColor: transparentBorder ? 'transparent' : undefined,
              transition: 'border-color 0.1s linear',
              selectors: {
                ':hover': {
                  borderColor: transparentBorder ? NeutralColors.gray30 : undefined,
                },
              },
            },
          },
        },
        sharedProps
      )
    )
  );
}
TextWidget.defaultProps = {
  schema: {},
  options: {},
  onBlur: function() {},
  onFocus: function() {},
};
//# sourceMappingURL=TextWidget.js.map
