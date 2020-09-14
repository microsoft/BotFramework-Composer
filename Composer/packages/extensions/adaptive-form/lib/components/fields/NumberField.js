'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.NumberField = void 0;
var tslib_1 = require('tslib');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var SpinButton_1 = require('office-ui-fabric-react/lib/SpinButton');
var react_1 = tslib_1.__importDefault(require('react'));
var FieldLabel_1 = require('../FieldLabel');
var floatNumberOfDecimals = 2;
var getInt = function (value, step) {
  return parseInt(value, 10) + step;
};
var getFloat = function (value, step) {
  var fixed = (parseFloat(value) + step).toFixed(floatNumberOfDecimals);
  return parseFloat(fixed);
};
var NumberField = function (props) {
  var description = props.description,
    disabled = props.disabled,
    id = props.id,
    label = props.label,
    onChange = props.onChange,
    readonly = props.readonly,
    schema = props.schema,
    value = props.value,
    required = props.required,
    uiOptions = props.uiOptions;
  var type = schema.type;
  var updateValue = function (step) {
    return function (value) {
      if (value === '') {
        onChange(0);
        return;
      }
      // if the number is a float, we need to convert to a fixed decimal place
      // in order to avoid floating point math rounding errors (ex. 1.2000000001)
      // ex. if step = 0.01, we fix to 2 decimals
      var newValue = type === 'integer' ? getInt(value, step) : getFloat(value, step);
      onChange(newValue);
    };
  };
  var step = type === 'integer' ? 1 : Math.pow(10, -floatNumberOfDecimals);
  var displayValue = typeof value === 'number' ? value.toString() : '';
  return react_1.default.createElement(
    react_1.default.Fragment,
    null,
    react_1.default.createElement(FieldLabel_1.FieldLabel, {
      description: description,
      helpLink: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink,
      id: id,
      label: label,
      required: required,
    }),
    react_1.default.createElement(SpinButton_1.SpinButton, {
      ariaLabel: label || format_message_1.default('numeric field'),
      decrementButtonAriaLabel: format_message_1.default('decrement by { step }', { step: step }),
      disabled: Boolean(schema.const) || readonly || disabled,
      id: id,
      incrementButtonAriaLabel: format_message_1.default('increment by { step }', { step: step }),
      step: step,
      styles: {
        labelWrapper: { display: 'none' },
      },
      value: displayValue,
      onDecrement: updateValue(-step),
      onIncrement: updateValue(step),
      onValidate: updateValue(0),
    })
  );
};
exports.NumberField = NumberField;
//# sourceMappingURL=NumberField.js.map
