// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export var calculateRangeSelection = function (focusedId, clickedId, orderedSelectableIds) {
    var range = [focusedId, clickedId].map(function (id) { return orderedSelectableIds.findIndex(function (x) { return x === id; }); });
    var _a = range.sort(), fromIndex = _a[0], toIndex = _a[1];
    return orderedSelectableIds.slice(fromIndex, toIndex + 1);
};
//# sourceMappingURL=calculateRangeSelection.js.map