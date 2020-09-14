// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var NodeIndexGenerator = /** @class */ (function () {
    function NodeIndexGenerator(initialId) {
        if (initialId === void 0) { initialId = 0; }
        this._id = 0;
        this._indexByNodeId = {};
        this._id = initialId;
    }
    NodeIndexGenerator.prototype.reset = function () {
        this._id = 0;
        this._indexByNodeId = {};
    };
    NodeIndexGenerator.prototype.getNodeIndex = function (nodeId) {
        var index;
        if (nodeId in this._indexByNodeId) {
            index = this._indexByNodeId[nodeId];
        }
        else {
            index = this._id++;
            this._indexByNodeId[nodeId] = index;
        }
        return index;
    };
    NodeIndexGenerator.prototype.getItemList = function () {
        var itemList = [];
        var ids = Object.keys(this._indexByNodeId);
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            var index = this._indexByNodeId[id];
            itemList[index] = { key: id };
        }
        return itemList;
    };
    return NodeIndexGenerator;
}());
export { NodeIndexGenerator };
//# sourceMappingURL=NodeIndexGetter.js.map