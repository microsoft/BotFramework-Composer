"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDialogEditApi = void 0;
var tslib_1 = require("tslib");
var shared_1 = require("@bfc/shared");
var dialogUtils_1 = require("@bfc/shared/lib/dialogUtils");
var useActionApi_1 = require("./useActionApi");
var appendNodesAfter = shared_1.DialogUtils.appendNodesAfter, queryNodes = shared_1.DialogUtils.queryNodes, insertNodes = shared_1.DialogUtils.insertNodes, deleteNode = shared_1.DialogUtils.deleteNode, deleteNodes = shared_1.DialogUtils.deleteNodes;
function useDialogEditApi(shellApi) {
    var _a = useActionApi_1.useActionApi(shellApi), constructActions = _a.constructActions, copyActions = _a.copyActions, deleteAction = _a.deleteAction, deleteActions = _a.deleteActions;
    function insertActions(dialogId, dialogData, targetArrayPath, targetArrayPosition, actionsToInsert) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var newNodes;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, constructActions(dialogId, actionsToInsert)];
                    case 1:
                        newNodes = _a.sent();
                        return [2 /*return*/, insertNodes(dialogData, targetArrayPath, targetArrayPosition, newNodes)];
                }
            });
        });
    }
    function insertAction(dialogId, dialogData, targetArrayPath, targetArrayPosition, actionToInsert) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, insertActions(dialogId, dialogData, targetArrayPath, targetArrayPosition, [actionToInsert])];
            });
        });
    }
    function insertActionsAfter(dialogId, dialogData, targetId, actionsToInsert) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var newNodes;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, constructActions(dialogId, actionsToInsert)];
                    case 1:
                        newNodes = _a.sent();
                        return [2 /*return*/, appendNodesAfter(dialogData, targetId, newNodes)];
                }
            });
        });
    }
    function deleteSelectedAction(dialogId, dialogData, actionId) {
        return deleteNode(dialogData, actionId, function (node) { return deleteAction(dialogId, node); });
    }
    function deleteSelectedActions(dialogId, dialogData, actionIds) {
        return deleteNodes(dialogData, actionIds, function (nodes) {
            deleteActions(dialogId, nodes);
        });
    }
    function disableSelectedActions(dialogId, dialogData, actionIds) {
        return dialogUtils_1.disableNodes(dialogData, actionIds);
    }
    function enableSelectedActions(dialogId, dialogData, actionIds) {
        return dialogUtils_1.enableNodes(dialogData, actionIds);
    }
    function copySelectedActions(dialogId, dialogData, actionIds) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var actions;
            return tslib_1.__generator(this, function (_a) {
                actions = queryNodes(dialogData, actionIds);
                return [2 /*return*/, copyActions(dialogId, actions)];
            });
        });
    }
    function cutSelectedActions(dialogId, dialogData, actionIds) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var cutActions, newDialog;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, copySelectedActions(dialogId, dialogData, actionIds)];
                    case 1:
                        cutActions = _a.sent();
                        newDialog = deleteSelectedActions(dialogId, dialogData, actionIds);
                        return [2 /*return*/, { dialog: newDialog, cutActions: cutActions }];
                }
            });
        });
    }
    function updateRecognizer(dialogId, dialogData, recognizer) {
        dialogData.recognizer = recognizer;
        return dialogData;
    }
    return {
        insertAction: insertAction,
        insertActions: insertActions,
        insertActionsAfter: insertActionsAfter,
        deleteSelectedAction: deleteSelectedAction,
        deleteSelectedActions: deleteSelectedActions,
        copySelectedActions: copySelectedActions,
        cutSelectedActions: cutSelectedActions,
        updateRecognizer: updateRecognizer,
        disableSelectedActions: disableSelectedActions,
        enableSelectedActions: enableSelectedActions,
    };
}
exports.useDialogEditApi = useDialogEditApi;
//# sourceMappingURL=useDialogEditApi.js.map