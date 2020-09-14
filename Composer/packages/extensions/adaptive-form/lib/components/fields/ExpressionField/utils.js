'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.getSelectedOption = exports.getOptions = exports.getOneOfOptions = void 0;
var tslib_1 = require('tslib');
var utils_1 = require('../../../utils');
function getOptionLabel(schema, parent) {
  var title = schema.title,
    enumOptions = schema.enum,
    items = schema.items;
  if (title) {
    return title.toLowerCase();
  }
  if (Array.isArray(enumOptions) && enumOptions.length > 0) {
    return 'dropdown';
  }
  var childType = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  // check array items
  if (!childType && typeof items === 'object') {
    var item = Array.isArray(items) ? items[0] : items;
    if (typeof item === 'object') {
      childType = Array.isArray(item.type) ? item.type[0] : item.type;
    }
  }
  var childLabel = childType || 'unknown';
  if (parent.type && !Array.isArray(parent.type)) {
    return parent.type + ' (' + childLabel + ')';
  }
  return childLabel;
}
function getOneOfOptions(oneOf, parentSchema, definitions) {
  return oneOf.reduce(function (all, item) {
    if (typeof item === 'object') {
      var resolved = utils_1.resolveRef(item, definitions);
      // if item has a one of, recurse on it
      if (item.oneOf) {
        return all.concat(getOneOfOptions(item.oneOf, item, definitions));
      }
      var label = getOptionLabel(resolved, parentSchema);
      all.push({
        key: label,
        text: label,
        data: { schema: resolved },
      });
    }
    return all;
  }, []);
}
exports.getOneOfOptions = getOneOfOptions;
function getOptions(schema, definitions) {
  var type = schema.type,
    oneOf = schema.oneOf,
    enumOptions = schema.enum;
  var expressionOption = {
    key: 'expression',
    text: 'expression',
    data: { schema: tslib_1.__assign(tslib_1.__assign({}, schema), { type: 'string' }) },
  };
  if (type && Array.isArray(type)) {
    var options = type.map(function (t) {
      return {
        key: t,
        text: t,
        data: { schema: tslib_1.__assign(tslib_1.__assign({}, schema), { type: t }) },
      };
    });
    type.length > 2 && options.push(expressionOption);
    options.sort(function (_a, _b) {
      var t1 = _a.text;
      var t2 = _b.text;
      return t1 > t2 ? 1 : -1;
    });
    return options;
  }
  if (oneOf && Array.isArray(oneOf)) {
    return getOneOfOptions(oneOf, schema, definitions);
  }
  // this could either be an expression or an enum value
  if (Array.isArray(enumOptions)) {
    return [
      {
        key: 'dropdown',
        text: 'dropdown',
        data: { schema: tslib_1.__assign(tslib_1.__assign({}, schema), { $role: undefined }) },
      },
      expressionOption,
    ];
  }
  return [expressionOption];
}
exports.getOptions = getOptions;
function getSelectedOption(value, options) {
  var expressionOption = options.find(function (_a) {
    var key = _a.key;
    return key === 'expression';
  });
  var enumOption = options.find(function (_a) {
    var _b;
    var schema = _a.data.schema;
    return (_b = schema.enum) === null || _b === void 0 ? void 0 : _b.includes(value);
  });
  var valueType = utils_1.getValueType(value);
  // return the enumOption if the value is included in the option's enum schema
  if (enumOption) {
    return enumOption;
  }
  // if its an array, we know it's not an expression
  if (valueType === 'integer') {
    // integer-type values should also count as numbers as far as the schema goes
    valueType = 'number';
  } else if (valueType === 'array') {
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
        return typeof itemSchema === 'object' && utils_1.getValueType(item_1) === itemSchema.type;
      }) || firstArrayOption
    );
  } else if (typeof value === 'undefined' || value === null) {
    // if the value if undefined, either default to expression or the first option
    return options.length > 2 ? expressionOption : options[0];
    // else if the value is a string and starts with '=' it is an expression
  } else if (
    expressionOption &&
    valueType === 'string' &&
    (value.startsWith('=') ||
      !options.find(function (_a) {
        var key = _a.key;
        return key === 'string';
      }))
  ) {
    return expressionOption;
  }
  // lastly, attempt to find the option based on value type
  return (
    options.find(function (_a) {
      var data = _a.data,
        key = _a.key;
      return data.schema.type === valueType && key !== 'expression';
    }) || options[0]
  );
}
exports.getSelectedOption = getSelectedOption;
//# sourceMappingURL=utils.js.map
