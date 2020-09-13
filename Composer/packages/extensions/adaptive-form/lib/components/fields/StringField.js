'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.StringField = exports.borderStyles = void 0;
var tslib_1 = require('tslib');
var react_1 = tslib_1.__importDefault(require('react'));
var fluent_theme_1 = require('@uifabric/fluent-theme');
var TextField_1 = require('office-ui-fabric-react/lib/TextField');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var FieldLabel_1 = require('../FieldLabel');
exports.borderStyles = function (transparentBorder, error) {
  return transparentBorder
    ? {
        fieldGroup: {
          borderColor: error ? undefined : 'transparent',
          transition: 'border-color 0.1s linear',
          selectors: {
            ':hover': {
              borderColor: error ? undefined : fluent_theme_1.NeutralColors.gray30,
            },
          },
        },
      }
    : {};
};
exports.StringField = function StringField(props) {
  var id = props.id,
    _a = props.value,
    value = _a === void 0 ? '' : _a,
    onChange = props.onChange,
    disabled = props.disabled,
    label = props.label,
    description = props.description,
    placeholder = props.placeholder,
    readonly = props.readonly,
    transparentBorder = props.transparentBorder,
    onFocus = props.onFocus,
    onBlur = props.onBlur,
    error = props.error,
    uiOptions = props.uiOptions,
    required = props.required;
  var handleFocus = function (e) {
    if (typeof onFocus === 'function') {
      e.stopPropagation();
      onFocus(id, value);
    }
  };
  var handleBlur = function (e) {
    if (typeof onBlur === 'function') {
      e.stopPropagation();
      onBlur(id, value);
    }
  };
  var handleChange = function (e, newValue) {
    onChange(newValue);
  };
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
    react_1.default.createElement(TextField_1.TextField, {
      ariaLabel: label || format_message_1.default('string field'),
      disabled: disabled,
      errorMessage: error,
      id: id,
      placeholder: placeholder,
      readOnly: readonly,
      styles: tslib_1.__assign(tslib_1.__assign({}, exports.borderStyles(Boolean(transparentBorder), Boolean(error))), {
        root: { width: '100%' },
        errorMessage: { display: 'none' },
      }),
      value: value,
      onBlur: handleBlur,
      onChange: handleChange,
      onFocus: handleFocus,
    })
  );
};
//# sourceMappingURL=StringField.js.map
