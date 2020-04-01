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
import React, { Suspense } from 'react';
import { LoadingSpinner } from '../../LoadingSpinner';
import { BaseField } from './BaseField';
var LgEditorWidget = React.lazy(function() {
  return import('../widgets/LgEditorWidget');
});
export var LgEditorField = function(props) {
  return React.createElement(
    BaseField,
    __assign({}, props),
    React.createElement(
      Suspense,
      { fallback: React.createElement(LoadingSpinner, null) },
      React.createElement(LgEditorWidget, {
        name: props.name,
        value: props.formData,
        formContext: props.formContext,
        onChange: props.onChange,
      })
    )
  );
};
//# sourceMappingURL=LgEditorField.js.map
