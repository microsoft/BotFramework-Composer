"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLuApi = void 0;
var tslib_1 = require("tslib");
var shared_1 = require("@bfc/shared");
/**
 * LU CRUD API
 */
exports.useLuApi = function (shellApi) {
    var addLuIntent = shellApi.addLuIntent, removeLuIntent = shellApi.removeLuIntent, getLuIntent = shellApi.getLuIntent;
    var createLuIntent = function (luFildId, intent, hostResourceId, hostResourceData) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var newLuIntentType, newLuIntentName, newLuIntent;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!intent)
                        return [2 /*return*/];
                    newLuIntentType = new shared_1.LuType(hostResourceData.$kind).toString();
                    newLuIntentName = new shared_1.LuMetaData(newLuIntentType, hostResourceId).toString();
                    newLuIntent = tslib_1.__assign(tslib_1.__assign({}, intent), { Name: newLuIntentName });
                    return [4 /*yield*/, addLuIntent(luFildId, newLuIntentName, newLuIntent)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, newLuIntentName];
            }
        });
    }); };
    var readLuIntent = function (luFileId, hostResourceId, hostResourceData) {
        var relatedLuIntentType = new shared_1.LuType(hostResourceData.$kind).toString();
        var relatedLuIntentName = new shared_1.LuMetaData(relatedLuIntentType, hostResourceId).toString();
        return getLuIntent(luFileId, relatedLuIntentName);
    };
    var deleteLuIntents = function (luFileId, luIntents) {
        return Promise.all(luIntents.map(function (intent) { return removeLuIntent(luFileId, intent); }));
    };
    return {
        createLuIntent: createLuIntent,
        readLuIntent: readLuIntent,
        deleteLuIntent: function (luFileId, luIntent) { return deleteLuIntents(luFileId, [luIntent]); },
        deleteLuIntents: deleteLuIntents,
    };
};
//# sourceMappingURL=useLuApi.js.map