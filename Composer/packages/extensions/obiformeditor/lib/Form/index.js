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
var __rest =
  (this && this.__rest) ||
  function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
import React from 'react';
import JSONForm from '@bfcomposer/react-jsonschema-form';
import * as widgets from './widgets';
import * as fields from './fields';
import ArrayFieldTemplate from './ArrayFieldTemplate';
import ObjectFieldTemplate from './ObjectFieldTemplate';
import FieldTemplate from './FieldTemplate';
import './styles.css';
function removeUndefinedOrEmpty(object) {
  if (object === null) {
    return null;
  }
  if (Array.isArray(object)) {
    return object.length > 0 ? object : undefined;
  }
  if (typeof object === 'object') {
    var obj = Object.assign({}, object); // Prevent mutation of source object.
    for (var key in obj) {
      if (obj[key] === undefined) {
        delete obj[key];
        continue;
      }
      var result = removeUndefinedOrEmpty(obj[key]);
      switch (typeof result) {
        case 'undefined':
          delete obj[key];
          break;
        case 'boolean':
          obj[key] = result;
          break;
        case 'object':
          if (Object.keys(result).length === 0) {
            delete obj[key];
          } else {
            obj[key] = result;
          }
          break;
        default:
          obj[key] = result;
      }
    }
    return obj;
  }
  return object;
}
var Form = function(props) {
  var formData = props.formData,
    schema = props.schema,
    uiSchema = props.uiSchema,
    onChange = props.onChange,
    formContext = props.formContext,
    rest = __rest(props, ['formData', 'schema', 'uiSchema', 'onChange', 'formContext']);
  return React.createElement(
    'div',
    { className: 'FormContainer' },
    React.createElement(
      JSONForm,
      __assign(
        {
          ArrayFieldTemplate: ArrayFieldTemplate,
          fields: fields,
          FieldTemplate: FieldTemplate,
          formatData: removeUndefinedOrEmpty,
          formContext: formContext,
          formData: formData,
          ObjectFieldTemplate: ObjectFieldTemplate,
          onChange: onChange,
          safeRenderCompletion: true,
          schema: schema,
          uiSchema: uiSchema,
          widgets: widgets,
        },
        rest
      )
    )
  );
};
Form.defaultProps = {
  onChange: function() {},
  onSubmit: function() {},
};
export default Form;
//# sourceMappingURL=index.js.map
