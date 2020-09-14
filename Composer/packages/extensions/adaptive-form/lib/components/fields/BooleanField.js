'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.BooleanField = void 0;
var tslib_1 = require('tslib');
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
var core_1 = require('@emotion/core');
var react_1 = tslib_1.__importDefault(require('react'));
var Dropdown_1 = require('office-ui-fabric-react/lib/Dropdown');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var FieldLabel_1 = require('../FieldLabel');
var BooleanField = function CheckboxWidget(props) {
  var onChange = props.onChange,
    value = props.value,
    label = props.label,
    id = props.id,
    schema = props.schema,
    required = props.required,
    uiOptions = props.uiOptions;
  var description = schema.description;
  var options = [
    {
      key: 'none',
      text: '',
    },
    {
      key: 'true',
      text: format_message_1.default('true'),
    },
    {
      key: 'false',
      text: format_message_1.default('false'),
    },
  ];
  var handleChange = function (e, option) {
    if (option) {
      var optionValue = option.key === 'none' ? undefined : option.key === 'true';
      onChange(optionValue);
    }
  };
  var selectedKey = typeof value === 'boolean' ? value.toString() : '';
  return core_1.jsx(
    react_1.default.Fragment,
    null,
    core_1.jsx(FieldLabel_1.FieldLabel, {
      inline: true,
      description: description,
      helpLink: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink,
      id: id,
      label: label,
      required: required,
    }),
    core_1.jsx(Dropdown_1.Dropdown, {
      ariaLabel: label || format_message_1.default('boolean field'),
      id: id,
      options: options,
      responsiveMode: Dropdown_1.ResponsiveMode.large,
      selectedKey: selectedKey,
      styles: {
        root: { width: '100%' },
        errorMessage: { display: 'none' },
      },
      onChange: handleChange,
    })
  );
};
exports.BooleanField = BooleanField;
//# sourceMappingURL=BooleanField.js.map
