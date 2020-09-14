'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.useObjectItems = exports.getPropertyItemProps = void 0;
var tslib_1 = require('tslib');
var shared_1 = require('@bfc/shared');
var react_1 = require('react');
var generateObjectEntries = function (value) {
  return Object.entries(value || {}).map(function (entry) {
    return createObjectItem.apply(void 0, entry);
  });
};
var createObjectItem = function (propertyName, propertyValue) {
  if (propertyName === void 0) {
    propertyName = '';
  }
  return {
    id: shared_1.generateUniqueId(),
    propertyName: propertyName,
    propertyValue: propertyValue,
  };
};
exports.getPropertyItemProps = function (items, index, onChange) {
  var handlePropertyNameChange = function (propertyName) {
    var updated = items.map(function (item, idx) {
      return idx === index ? tslib_1.__assign(tslib_1.__assign({}, item), { propertyName: propertyName }) : item;
    });
    onChange(updated);
  };
  var handlePropertyValueChange = function (propertyValue) {
    var updated = items.map(function (item, idx) {
      return idx === index ? tslib_1.__assign(tslib_1.__assign({}, item), { propertyValue: propertyValue }) : item;
    });
    onChange(updated);
  };
  var handleDelete = function () {
    onChange(
      items.filter(function (_, idx) {
        return idx !== index;
      })
    );
  };
  return {
    onChange: handlePropertyValueChange,
    onDelete: handleDelete,
    onNameChange: handlePropertyNameChange,
  };
};
function useObjectItems(items, onChange) {
  var _a = react_1.useState(generateObjectEntries(items)),
    cache = _a[0],
    setCache = _a[1];
  var handleChange = function (items) {
    setCache(items);
    onChange(
      items.reduce(function (acc, _a) {
        var _b;
        var propertyName = _a.propertyName,
          propertyValue = _a.propertyValue;
        return tslib_1.__assign(tslib_1.__assign({}, acc), ((_b = {}), (_b[propertyName] = propertyValue), _b));
      }, {})
    );
  };
  var addProperty = function (name, value) {
    if (name === void 0) {
      name = '';
    }
    if (
      !cache.some(function (_a) {
        var propertyName = _a.propertyName;
        return propertyName === name;
      })
    ) {
      handleChange(tslib_1.__spreadArrays(cache, [createObjectItem(name, value)]));
    }
  };
  return { addProperty: addProperty, objectEntries: cache, onChange: handleChange };
}
exports.useObjectItems = useObjectItems;
//# sourceMappingURL=objectUtils.js.map
