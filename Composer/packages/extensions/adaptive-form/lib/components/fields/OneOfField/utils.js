'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.getFieldProps = exports.getSelectedOption = exports.getOptions = void 0;
var tslib_1 = require('tslib');
var merge_1 = tslib_1.__importDefault(require('lodash/merge'));
var omit_1 = tslib_1.__importDefault(require('lodash/omit'));
var utils_1 = require('../../../utils');
function getOptionLabel(schema) {
  var title = schema.title,
    enumOptions = schema.enum;
  var type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (title) {
    return title.toLowerCase();
  }
  if (Array.isArray(enumOptions) && enumOptions.length > 0) {
    return 'dropdown';
  }
  return type || 'unknown';
}
function getOptions(schema, definitions) {
  var type = schema.type,
    oneOf = schema.oneOf;
  if (type && Array.isArray(type)) {
    var options = type.map(function (t) {
      return {
        key: t,
        text: t,
        data: { schema: tslib_1.__assign(tslib_1.__assign({}, schema), { type: t }) },
      };
    });
    options.sort(function (_a, _b) {
      var t1 = _a.text;
      var t2 = _b.text;
      return t1 > t2 ? 1 : -1;
    });
    return options;
  }
  if (oneOf && Array.isArray(oneOf)) {
    return oneOf
      .map(function (s) {
        if (typeof s === 'object') {
          var resolved = utils_1.resolveRef(s, definitions);
          var merged = merge_1.default({}, omit_1.default(schema, 'oneOf'), resolved);
          var label = getOptionLabel(resolved);
          return {
            key: label,
            text: label,
            data: { schema: merged },
          };
        }
      })
      .filter(Boolean);
  }
  return [];
}
exports.getOptions = getOptions;
function getSelectedOption(value, options) {
  if (options.length === 0) {
    return;
  }
  // if the value if undefined, default to the first option
  if (typeof value === 'undefined' || value === null) {
    return options[0];
  }
  var valueType = utils_1.getValueType(value);
  if (valueType === 'array') {
    var item_1 = value[0];
    var firstArrayOption = options.find(function (o) {
      return o.data.schema.type === 'array';
    });
    // if there is nothing in the array, default to the first array type
    if (!item_1) {
      return firstArrayOption;
    }
    // else, find the option with an item schema that matches item type
    return (
      options.find(function (o) {
        var schema = o.data.schema;
        var itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
        return itemSchema && utils_1.getValueType(item_1) === itemSchema.type;
      }) || firstArrayOption
    );
  }
  // lastly, attempt to find the option based on value type
  return (
    options.find(function (_a) {
      var data = _a.data;
      return data.schema.type === valueType;
    }) || options[0]
  );
}
exports.getSelectedOption = getSelectedOption;
function getFieldProps(props, schema) {
  var enumOptions = schema === null || schema === void 0 ? void 0 : schema.enum;
  return tslib_1.__assign(tslib_1.__assign({}, props), {
    enumOptions: enumOptions,
    schema: schema || {},
    transparentBorder: false,
    // allows object fields to render their labels
    label: (schema === null || schema === void 0 ? void 0 : schema.type) === 'object' ? undefined : false,
    depth: props.depth - 1,
    placeholder: utils_1.getUiPlaceholder(tslib_1.__assign({}, props)),
    description: utils_1.getUiDescription(tslib_1.__assign(tslib_1.__assign({}, props), { description: undefined })),
  });
}
exports.getFieldProps = getFieldProps;
//# sourceMappingURL=utils.js.map
