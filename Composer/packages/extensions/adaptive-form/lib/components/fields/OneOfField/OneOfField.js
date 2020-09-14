'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.OneOfField = void 0;
var tslib_1 = require('tslib');
/** @jsx jsx */
var core_1 = require('@emotion/core');
var react_1 = require('react');
var extension_1 = require('@bfc/extension');
var Dropdown_1 = require('office-ui-fabric-react/lib/Dropdown');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var FieldLabel_1 = require('../../FieldLabel');
var utils_1 = require('../../../utils');
var styles_1 = require('../styles');
var utils_2 = require('./utils');
var OneOfField = function (props) {
  var definitions = props.definitions,
    description = props.description,
    id = props.id,
    label = props.label,
    schema = props.schema,
    required = props.required,
    uiOptions = props.uiOptions,
    value = props.value;
  var formUIOptions = extension_1.useFormConfig();
  var options = react_1.useMemo(
    function () {
      return utils_2.getOptions(schema, definitions);
    },
    [schema, definitions]
  );
  var initialSelectedOption = react_1.useMemo(function () {
    return utils_2.getSelectedOption(value, options) || { key: '', data: { schema: undefined } };
  }, []);
  var _a = react_1.useState(initialSelectedOption),
    _b = _a[0],
    selectedKey = _b.key,
    selectedSchema = _b.data.schema,
    setSelectedOption = _a[1];
  var handleTypeChange = function (_e, option) {
    if (option) {
      setSelectedOption(option);
      props.onChange(undefined);
    }
  };
  var Field = utils_1.resolveFieldWidget(selectedSchema || {}, props.uiOptions, formUIOptions);
  return core_1.jsx(
    'div',
    { css: styles_1.oneOfField.container },
    core_1.jsx(
      'div',
      { css: styles_1.oneOfField.label },
      core_1.jsx(FieldLabel_1.FieldLabel, {
        description: description,
        helpLink: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink,
        id: id,
        label: label,
        required: required,
      }),
      options &&
        options.length > 1 &&
        core_1.jsx(Dropdown_1.Dropdown, {
          ariaLabel: format_message_1.default('select property type'),
          'data-testid': 'OneOfFieldType',
          id: props.id + '-oneOf',
          options: options,
          responsiveMode: Dropdown_1.ResponsiveMode.large,
          selectedKey: selectedKey,
          styles: {
            caretDownWrapper: { height: '24px', lineHeight: '24px' },
            root: { flexBasis: 'auto', padding: '5px 0', minWidth: '110px' },
            title: { height: '24px', lineHeight: '20px' },
          },
          onChange: handleTypeChange,
        })
    ),
    core_1.jsx(Field, tslib_1.__assign({}, utils_2.getFieldProps(props, selectedSchema)))
  );
};
exports.OneOfField = OneOfField;
//# sourceMappingURL=OneOfField.js.map
