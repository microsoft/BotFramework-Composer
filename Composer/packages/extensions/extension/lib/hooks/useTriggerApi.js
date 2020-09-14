"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTriggerApi = void 0;
var tslib_1 = require("tslib");
var shared_1 = require("@bfc/shared");
var get_1 = tslib_1.__importDefault(require("lodash/get"));
var useActionApi_1 = require("./useActionApi");
var useLuApi_1 = require("./useLuApi");
exports.useTriggerApi = function (shellAPi) {
    var deleteActions = useActionApi_1.useActionApi(shellAPi).deleteActions;
    var deleteLuIntent = useLuApi_1.useLuApi(shellAPi).deleteLuIntent;
    var deleteTrigger = function (dialogId, trigger) {
        if (!trigger)
            return;
        // Clean the lu resource on intent trigger
        if (get_1.default(trigger, '$kind') === shared_1.SDKKinds.OnIntent) {
            var triggerIntent = get_1.default(trigger, 'intent', '');
            deleteLuIntent(dialogId, triggerIntent);
        }
        // Clean action resources
        var actions = get_1.default(trigger, 'actions');
        if (!actions || !Array.isArray(actions))
            return;
        deleteActions(dialogId, actions);
    };
    return {
        deleteTrigger: deleteTrigger,
    };
};
//# sourceMappingURL=useTriggerApi.js.map