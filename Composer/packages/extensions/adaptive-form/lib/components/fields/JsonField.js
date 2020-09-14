'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.JsonField = void 0;
var tslib_1 = require('tslib');
/** @jsx jsx */
var core_1 = require('@emotion/core');
var react_1 = tslib_1.__importDefault(require('react'));
var extension_1 = require('@bfc/extension');
var code_editor_1 = require('@bfc/code-editor');
var FieldLabel_1 = require('../FieldLabel');
var fieldStyle = core_1.css(
  templateObject_1 ||
    (templateObject_1 = tslib_1.__makeTemplateObject(
      ['\n  max-height: 300px;\n\n  label: JsonField;\n'],
      ['\n  max-height: 300px;\n\n  label: JsonField;\n']
    ))
);
var JsonField = function (props) {
  var onChange = props.onChange,
    value = props.value,
    id = props.id,
    label = props.label,
    description = props.description,
    uiOptions = props.uiOptions,
    required = props.required,
    schema = props.schema;
  var userSettings = extension_1.useShellApi().userSettings;
  return core_1.jsx(
    react_1.default.Fragment,
    null,
    core_1.jsx(FieldLabel_1.FieldLabel, {
      description: description,
      helpLink: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink,
      id: id,
      label: label,
      required: required,
    }),
    core_1.jsx(
      'div',
      { css: fieldStyle, 'data-testid': 'JsonFieldEditor' },
      core_1.jsx(code_editor_1.JsonEditor, {
        editorSettings: userSettings.codeEditor,
        height: 200,
        schema: schema,
        value: value,
        onChange: onChange,
      })
    )
  );
};
exports.JsonField = JsonField;
var templateObject_1;
//# sourceMappingURL=JsonField.js.map
