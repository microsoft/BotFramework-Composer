'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.useArrayItems = exports.getArrayItemProps = void 0;
var tslib_1 = require('tslib');
var shared_1 = require('@bfc/shared');
var react_1 = require('react');
var generateArrayItems = function (value) {
  return value.map(function (i) {
    return {
      id: shared_1.generateUniqueId(),
      value: i,
    };
  });
};
var createArrayItem = function (value) {
  return {
    id: shared_1.generateUniqueId(),
    value: value,
  };
};
exports.getArrayItemProps = function (items, index, onChange) {
  var onItemChange = function (newValue) {
    var updated = items.map(function (item, i) {
      if (index === i) {
        return tslib_1.__assign(tslib_1.__assign({}, item), { value: newValue });
      }
      return item;
    });
    onChange(updated);
  };
  var onReorder = function (aIdx) {
    var copy = tslib_1.__spreadArrays(items);
    var tmp = copy[index];
    copy[index] = copy[aIdx];
    copy[aIdx] = tmp;
    onChange(copy);
  };
  var onRemove = function () {
    var newData = items.slice(0, index).concat(items.slice(index + 1));
    onChange(newData);
  };
  return {
    canRemove: true,
    canMoveDown: index < items.length - 1,
    canMoveUp: index > 0,
    index: index,
    onChange: onItemChange,
    onReorder: onReorder,
    onRemove: onRemove,
  };
};
function useArrayItems(items, onChange) {
  var _a = react_1.useState(generateArrayItems(items)),
    cache = _a[0],
    setCache = _a[1];
  var handleChange = function (newItems) {
    setCache(newItems);
    onChange(
      newItems.map(function (_a) {
        var value = _a.value;
        return value;
      })
    );
  };
  var addItem = function (newItem) {
    handleChange(cache.concat(createArrayItem(newItem)));
  };
  return { arrayItems: cache, handleChange: handleChange, addItem: addItem };
}
exports.useArrayItems = useArrayItems;
//# sourceMappingURL=arrayUtils.js.map
