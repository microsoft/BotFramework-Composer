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
import { findSchemaDefinition } from '@bfcomposer/react-jsonschema-form/lib/utils';
import StringArray from './StringArray';
import ObjectArray from './ObjectArray';
import IDialogArray from './IDialogArray';
var ArrayFieldTemplate = function(props) {
  var registry = props.registry,
    schema = props.schema;
  if (!schema.items) {
    return null;
  }
  var itemSchema = schema.items;
  var $ref = itemSchema.$ref;
  if (!itemSchema.type && $ref) {
    itemSchema = findSchemaDefinition($ref, registry.definitions);
  }
  switch (itemSchema.type) {
    case 'object':
      if ($ref && $ref.includes('IDialog')) {
        return React.createElement(IDialogArray, __assign({}, props));
      }
      return React.createElement(ObjectArray, __assign({}, props));
    default:
      return React.createElement(StringArray, __assign({}, props));
  }
};
export default ArrayFieldTemplate;
//# sourceMappingURL=index.js.map
