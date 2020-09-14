// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export var normalizeSelection = function (selectedIds) {
    if (!Array.isArray(selectedIds))
        return [];
    // filter invalid ids such as 'actions[0].diamond'
    var validIds = selectedIds.filter(function (id) { return id.match(/.*\w+\[\d+\]$/); });
    // events[0] < events[0].actions[0] < events[1] < events[1].actions[0]
    var ascendingIds = sortActionIds(validIds);
    for (var i = 0; i < ascendingIds.length; i++) {
        var parentId = ascendingIds[i];
        if (!parentId)
            continue;
        for (var j = i + 1; j < ascendingIds.length; j++) {
            if (ascendingIds[j].startsWith(parentId)) {
                ascendingIds[j] = '';
            }
        }
    }
    return ascendingIds.filter(function (id) { return id; });
};
export var sortActionIds = function (actionIds) {
    var parsedActionIds = actionIds.map(function (id) { return ({
        id: id,
        paths: id
            .split('.')
            .map(function (x) { return x.replace(/\w+\[(\d+)\]/, '$1'); })
            .map(function (x) { return parseInt(x) || 0; }),
    }); });
    var sorted = parsedActionIds.sort(function (a, b) {
        var aPaths = a.paths;
        var bPaths = b.paths;
        var diffIndex = 0;
        while (diffIndex < aPaths.length && diffIndex < bPaths.length && aPaths[diffIndex] === bPaths[diffIndex]) {
            diffIndex++;
        }
        var flag = (aPaths[diffIndex] === undefined ? '0' : '1') + (bPaths[diffIndex] === undefined ? '0' : '1');
        switch (flag) {
            case '00':
                // a equal b ('actions[0]', 'actions[0]')
                return 0;
            case '01':
                // a is b's parent, a < b ('actions[0]', 'actions[0].actions[0]')
                return -1;
            case '10':
                // a is b's child, a > b ('actions[0].actions[0]', 'actions[0]')
                return 1;
            case '11':
                return aPaths[diffIndex] - bPaths[diffIndex];
            default:
                return 0;
        }
    });
    return sorted.map(function (x) { return x.id; });
};
//# sourceMappingURL=normalizeSelection.js.map