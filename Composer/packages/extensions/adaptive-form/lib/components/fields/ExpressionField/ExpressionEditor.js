'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.ExpressionEditor = void 0;
var tslib_1 = require('tslib');
var extension_1 = require('@bfc/extension');
var intellisense_1 = require('@bfc/intellisense');
var Icon_1 = require('office-ui-fabric-react/lib/Icon');
var react_1 = tslib_1.__importDefault(require('react'));
var TextField_1 = require('office-ui-fabric-react/lib/TextField');
var getIntellisenseUrl_1 = require('../../../utils/getIntellisenseUrl');
var ExpressionEditor = function (props) {
  var id = props.id,
    _a = props.value,
    value = _a === void 0 ? '' : _a,
    onChange = props.onChange,
    disabled = props.disabled,
    placeholder = props.placeholder,
    readonly = props.readonly,
    error = props.error;
  var projectId = extension_1.useShellApi().projectId;
  return react_1.default.createElement(
    intellisense_1.IntellisenseTextField,
    {
      id: 'intellisense-' + id,
      projectId: projectId,
      scopes: ['expressions', 'user-variables'],
      url: getIntellisenseUrl_1.getIntellisenseUrl(),
      value: value,
      onChange: onChange,
    },
    function (textFieldValue, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField) {
      return react_1.default.createElement(TextField_1.TextField, {
        disabled: disabled,
        errorMessage: error,
        id: id,
        placeholder: placeholder,
        readOnly: readonly,
        styles: {
          root: { width: '100%' },
          errorMessage: { display: 'none' },
        },
        value: textFieldValue,
        onChange: function (_e, newValue) {
          return onValueChanged(newValue || '');
        },
        onClick: onClickTextField,
        onKeyDown: onKeyDownTextField,
        onKeyUp: onKeyUpTextField,
        onRenderPrefix: function () {
          return react_1.default.createElement(Icon_1.Icon, { iconName: 'Variable' });
        },
      });
    }
  );
};
exports.ExpressionEditor = ExpressionEditor;
//# sourceMappingURL=ExpressionEditor.js.map
