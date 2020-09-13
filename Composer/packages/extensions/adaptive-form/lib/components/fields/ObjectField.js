'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ObjectField = void 0;
var tslib_1 = require('tslib');
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var react_1 = tslib_1.__importDefault(require('react'));
var utils_1 = require('../../utils');
var FormRow_1 = require('../FormRow');
var ObjectField = function ObjectField(props) {
  var schema = props.schema,
    uiOptions = props.uiOptions,
    depth = props.depth,
    value = props.value,
    label = props.label,
    rest = tslib_1.__rest(props, ['schema', 'uiOptions', 'depth', 'value', 'label']);
  if (!schema) {
    return null;
  }
  var newDepth = depth + 1;
  var handleChange = function (field) {
    return function (data) {
      var newData = tslib_1.__assign({}, value);
      if (typeof data === 'undefined' || (typeof data === 'string' && data.length === 0)) {
        delete newData[field];
      } else {
        newData[field] = data;
      }
      props.onChange(newData);
    };
  };
  var orderedProperties = utils_1.getOrderedProperties(schema, uiOptions, value);
  return react_1.default.createElement(
    react_1.default.Fragment,
    null,
    orderedProperties.map(function (row) {
      return react_1.default.createElement(
        FormRow_1.FormRow,
        tslib_1.__assign({ key: props.id + '.' + (typeof row === 'string' ? row : row.join('_')) }, rest, {
          depth: newDepth,
          row: row,
          schema: schema,
          uiOptions: uiOptions,
          value: value,
          onChange: handleChange,
        })
      );
    })
  );
};
exports.ObjectField = ObjectField;
//# sourceMappingURL=ObjectField.js.map
