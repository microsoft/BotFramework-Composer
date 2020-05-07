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
import { JsonEditor } from '@bfc/code-editor';
import './styles.css';
import { BaseField } from './BaseField';
export var JsonField = function(props) {
  return React.createElement(
    BaseField,
    __assign({}, props, { className: 'JsonField' }),
    React.createElement(
      'div',
      { style: { height: '315px' } },
      React.createElement(JsonEditor, { onChange: props.onChange, value: props.formData })
    )
  );
};
//# sourceMappingURL=JsonField.js.map
