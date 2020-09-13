'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.ExpressionField = void 0;
var tslib_1 = require('tslib');
/** @jsx jsx */
var code_editor_1 = require('@bfc/code-editor');
var extension_1 = require('@bfc/extension');
var core_1 = require('@emotion/core');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var Dropdown_1 = require('office-ui-fabric-react/lib/Dropdown');
var react_1 = tslib_1.__importStar(require('react'));
var utils_1 = require('../../../utils');
var FieldLabel_1 = require('../../FieldLabel');
var ExpressionEditor_1 = require('./ExpressionEditor');
var utils_2 = require('./utils');
var styles = {
  container: core_1.css(
    templateObject_1 ||
      (templateObject_1 = tslib_1.__makeTemplateObject(
        ['\n    width: 100%;\n\n    label: ExpressionFieldContainer;\n  '],
        ['\n    width: 100%;\n\n    label: ExpressionFieldContainer;\n  ']
      ))
  ),
  field: core_1.css(
    templateObject_2 ||
      (templateObject_2 = tslib_1.__makeTemplateObject(
        ['\n    min-height: 66px;\n  '],
        ['\n    min-height: 66px;\n  ']
      ))
  ),
  labelContainer: core_1.css(
    templateObject_3 ||
      (templateObject_3 = tslib_1.__makeTemplateObject(
        [
          '\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n\n    label: ExpressionField;\n  ',
        ],
        [
          '\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n\n    label: ExpressionField;\n  ',
        ]
      ))
  ),
};
var ExpressionField = function (props) {
  var id = props.id,
    value = props.value,
    label = props.label,
    description = props.description,
    schema = props.schema,
    uiOptions = props.uiOptions,
    definitions = props.definitions,
    required = props.required,
    className = props.className;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var $role = schema.$role,
    expressionSchema = tslib_1.__rest(schema, ['$role']);
  var formUIOptions = extension_1.useFormConfig();
  var userSettings = extension_1.useShellApi().userSettings;
  var options = react_1.useMemo(function () {
    return utils_2.getOptions(expressionSchema, definitions);
  }, []);
  var initialSelectedOption = react_1.useMemo(function () {
    return utils_2.getSelectedOption(value, options) || { key: '', data: { schema: {} } };
  }, []);
  var _a = react_1.useState(initialSelectedOption),
    _b = _a[0],
    selectedKey = _b.key,
    selectedSchema = _b.data.schema,
    setSelectedOption = _a[1];
  var handleTypeChange = function (_e, option) {
    if (option && option.key !== selectedKey) {
      setSelectedOption(option);
      props.onChange(undefined);
    }
  };
  var renderTypeTitle = function (options) {
    var option = options && options[0];
    return option ? core_1.jsx(react_1.default.Fragment, null, option.text) : null;
  };
  var renderField = function () {
    if (!selectedSchema || Array.isArray(selectedSchema.type) || !selectedSchema.type) {
      return null;
    }
    // attempt to get a placeholder with the selected schema
    var placeholder =
      utils_1.getUiPlaceholder(tslib_1.__assign(tslib_1.__assign({}, props), { schema: selectedSchema })) ||
      props.placeholder;
    var enumOptions = selectedSchema === null || selectedSchema === void 0 ? void 0 : selectedSchema.enum;
    if (selectedKey === 'expression') {
      return core_1.jsx(ExpressionEditor_1.ExpressionEditor, tslib_1.__assign({}, props, { placeholder: placeholder }));
    }
    // return a json editor for open ended obejcts
    if (
      (selectedSchema.type === 'object' && !selectedSchema.properties) ||
      (selectedSchema.type === 'array' && !selectedSchema.items && !selectedSchema.oneOf)
    ) {
      var defaultValue = selectedSchema.type === 'object' ? {} : [];
      return core_1.jsx(code_editor_1.JsonEditor, {
        key: selectedSchema.type,
        editorSettings: userSettings.codeEditor,
        height: 100,
        id: props.id,
        schema: selectedSchema,
        value: value || defaultValue,
        onChange: props.onChange,
      });
    }
    var Field = utils_1.resolveFieldWidget(selectedSchema, uiOptions, formUIOptions);
    return core_1.jsx(
      Field,
      tslib_1.__assign({ key: selectedSchema.type }, props, {
        css: { label: 'ExpressionFieldValue' },
        enumOptions: enumOptions,
        label: selectedSchema.type !== 'object' ? false : undefined,
        // allow object fields to render their labels
        placeholder: placeholder,
        schema: selectedSchema,
        transparentBorder: false,
        uiOptions: tslib_1.__assign(tslib_1.__assign({}, props.uiOptions), { helpLink: 'https://bing.com' }),
      })
    );
  };
  var shouldRenderContainer = label || (options && options.length > 1);
  var dropdownWidth = react_1.useMemo(
    function () {
      return options.reduce(function (maxLength, _a) {
        var text = _a.text;
        return Math.max(maxLength, text.length);
      }, 0) > 'expression'.length
        ? -1
        : 0;
    },
    [options]
  );
  return core_1.jsx(
    'div',
    { className: className, css: styles.container },
    shouldRenderContainer &&
      core_1.jsx(
        'div',
        { css: styles.labelContainer },
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
            'data-testid': 'expression-type-dropdown-' + label,
            dropdownWidth: dropdownWidth,
            id: props.id + '-type',
            options: options,
            responsiveMode: Dropdown_1.ResponsiveMode.large,
            selectedKey: selectedKey,
            styles: {
              caretDownWrapper: { height: '24px', lineHeight: '24px' },
              root: { flexBasis: 'auto', padding: '5px 0', minWidth: '110px' },
              title: { height: '24px', lineHeight: '20px' },
            },
            onChange: handleTypeChange,
            onRenderTitle: renderTypeTitle,
          })
      ),
    renderField()
  );
};
exports.ExpressionField = ExpressionField;
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=ExpressionField.js.map
