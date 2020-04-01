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
import { UnsupportedField } from './UnsupportedField';
export var SelectorField = function(props) {
  return React.createElement(UnsupportedField, __assign({}, props, { fieldName: 'SelectorField' }));
};
//# sourceMappingURL=SelectorField.js.map
